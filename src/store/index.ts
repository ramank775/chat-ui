import { ChatDB } from "./db";
import { Socket } from "./socket";
import { EventEmitter } from "./eventEmitter";
enum MessageStatus {
    READ = 0,
    UNREAD = 1
}

export class Store {
    private _socket: Socket;
    private chatDbConnector: ChatDB;
    private user?: { username: string, name: string, profile_img: string };
    private _uniqueId: number;
    private newMessageEvent: EventEmitter<{}>;
    constructor(host: string) {
        const socketUrl = `wss://${host}/wss/`;
        this._socket = new Socket(socketUrl);
        this.chatDbConnector = new ChatDB();
        this._uniqueId = (new Date().getTime() * 10 + 1);
        this.newMessageEvent = new EventEmitter<{}>()
        this._socket.onMessage = (msgs: any) => {
            msgs = Array.isArray(msgs) ? msgs : [msgs];
            msgs.forEach(async (msg: any) => {
                await this.addMessage(msg);
                this.newMessageEvent.emit(msg);
            });
        }
    }

    private getCookie(cname: string) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    private setCookie(cname: string, cvalue: string, exdays: number) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    private getUserInfoFromCookies() {
        const username = this.getCookie('user');
        const accesskey = this.getCookie('accesskey');
        return [username, accesskey];
    }

    private async setLoginInfo(user: { name: string, username: string, accesskey: string }) {
        this.setCookie('user', user.username, 1000);
        this.setCookie('accesskey', user.accesskey, 1000);
        this.user = {
            username: user.username,
            name: user.name,
            profile_img: ''
        };
        await this.chatDbConnector.db?.put('contacts', {
            username: user.username,
            name: user.name,
            profile_img: '',
            status: -1
        });

    }

    private get uniqueId() {
        return ++this._uniqueId;
    }



    private async addMessage(msg: { msgId: string, from: string, text: string, to: string, status: MessageStatus, user: any, self:Boolean }) {
        msg.status = MessageStatus.UNREAD;
        if (!this.user) return;
        const transcation = this.chatDbConnector.db?.transaction('messages', 'readwrite');
        if (!transcation) return;
        this.chatDbConnector.db?.add('messages', msg);
        let sender = await this.getUserByUsername(msg.from);
        msg.user = sender;
        msg.self = false;
        if(!sender) return;
        const chat = await transcation.db.get('chat', sender.username)
        if (!chat) {
            await transcation.db.add('chat', { type: '1-1', id: sender.username, users: [this.user.username, sender.username] })
        }
        const contact = await transcation.db.get('contacts', sender.username);
        if (!contact) {
            await this.addContact(sender);
        }
    }

    isLogin() {
        const [username, accesskey] = this.getUserInfoFromCookies()
        return !!(username && accesskey)
    }

    async getUser() {
        const [username] = this.getUserInfoFromCookies();
        if (!this.user) {
            const user = await this.chatDbConnector.db?.get('contacts', username);
            if (!user) {
                this.user = undefined;
                return null;
            }
            this.user = {
                name: user.name,
                profile_img: user.profile_img,
                username: user.username
            }
        }
        return this.user;
    }

    async connect(onlydb: Boolean = false) {
        await this.chatDbConnector.connect();
        if (onlydb) return;
        await new Promise((resolve, reject) => {
            this._socket.connect();
            this._socket.onConnect = resolve;
            this._socket.onError = reject;
        })
        this._socket.onError = undefined;
    }

    async getContacts(searchText?: string) {
        let contactList = await this.chatDbConnector.db?.getAll('contacts')
        contactList = contactList?.filter(x => x.status != -1);
        if (searchText) {
            contactList = contactList?.filter(x => {
                searchText = (searchText || '').toUpperCase();
                return x.name.toUpperCase().indexOf(searchText) && x.username.indexOf(searchText);
            });
        }
        return contactList;
    }

    async addContact(contact: { name: string, username: string, profile_img: string, status: number }) {
        contact.status = contact.status ?? 0
        await this.chatDbConnector.db?.add('contacts', contact)
    }

    async sendMessage(message: { to: { name: string, username: string, profile_img: string, status: number }, text: string }) {
        if (!this.user) return;
        const transcation = this.chatDbConnector.db?.transaction('messages', 'readwrite');
        if (!transcation) return;

        const msgId = `${this.user.username}_${this.uniqueId}`;
        const db_msg = {
            msgId: msgId,
            from: this.user.username,
            text: message.text,
            to: message.to.username,
            status: MessageStatus.READ
        };
        await transcation.store.add(db_msg);
        this._socket.send(db_msg);
        const chat = await transcation.db.get('chat', message.to.username)
        if (!chat) {
            await transcation.db.add('chat', { type: '1-1', id: message.to.username, users: [this.user.username, message.to.username] })
        }
        const contact = await transcation.db.get('contacts', message.to.username);
        if (!contact) {
            await this.addContact(message.to);
        }
        return transcation.done;
    }

    async getMessages(chatId: string) {
        return await this.chatDbConnector.db?.getAllFromIndex('messages', 'by-chatId', chatId)
    }

    async newMessage(msg: { to: string, text: string, from: string, msgId: string }) {
        if (!this.user) return;
        const db = this.chatDbConnector.db;
        if (!db) return;
        await db.add('messages', { ...msg, status: MessageStatus.UNREAD });
        const chat = await db.get('chat', msg.from);
        if (!chat) {
            await db.add('chat', { type: '1-1', id: msg.from, users: [this.user.username, msg.from] });
        }
    }

    async login(login: { username: string, psw: string }) {
        const resp = fetch('/login', {
            method: 'post',
            body: JSON.stringify({
                username: login.username,
                secretPhase: login.psw
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(res => res.json())
            .then(res => {
                return res;
            })
            .then(res => {
                this.setLoginInfo(res);
                return res;
            });

        return resp;
    }

    async signup(value: { username: string, name: string, secretPhase: string }) {
        const resp = await fetch('/register', {
            method: 'post',
            body: JSON.stringify(value),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(res => res.json())
            .then(res => {
                return {
                    ...res,
                    name: value.name,
                };
            })
            .then(res => {
                this.setLoginInfo(res);
                return res;
            });

        return resp;
    }

    async validateUsername(username: string) {
        return await fetch('/exist', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ username })
        }).then(response => response.json())
            .then(({ status }) => {
                return !status;
            });
    }

    async searchUsers(searchText: string) {
        return await fetch(`/profile/search?q=${searchText}`)
            .then(resp => resp.json());
    }
    async getUserByUsername(username: string) {
        let user = await this.chatDbConnector.db?.get('contacts', username);
        if (user) {
            return user;
        }
        user = await fetch(`/profile/get?username=${username}`)
            .then(res => res.json());
        return user;
    }
}
