import { ChatDB } from "./db";
import { Socket } from "./socket";
import { EventEmitter } from "./eventEmitter";
import { MessageStatus, Message, UserStatus, User, Chat, ChatType, ChatViewModel, ServerMessage } from "../model";

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
        this.newMessageEvent = new EventEmitter<Message>();
        this._socket.onMessage = (msgs: ServerMessage | ServerMessage[]) => {
            msgs = Array.isArray(msgs) ? msgs : [msgs];
            const currentUser = this.user;
            if (!currentUser) return;

            msgs.forEach(async (msg: ServerMessage) => {
                const chatId = msg.to === currentUser.username ? msg.from : msg.to;
                msg.chatId = chatId;
                switch (msg.category) {
                    case 'notification':
                        this.handleNotification(msg);
                        break;
                    default:
                        {
                            const message = new Message({
                                ...msg,
                                status: MessageStatus.UNREAD,
                                self: false
                            });
                            await this.addMessageToDb(message);
                            this.newMessageEvent.emit(message);
                        }
                        break;
                }
            });

        }
    }

    private async handleNotification(msg: ServerMessage) {
        const db = this.chatDbConnector.db;
        if (!db) return;
        const currentUser = this.user;
        if(!currentUser) return;
        switch (msg.module) {
            case 'group':
                {
                    let message: Message | undefined;
                    const group = await this.getGroupById(msg.to);
                    const chat = await db.get('chat', group.groupId);
                    if (!chat) {
                        await db.add('chat', {
                            type: ChatType.GROUP,
                            users: group.members,
                            id: group.groupId,
                            name: group.name
                        }, group.groupId);
                    }
                    switch (msg.action) {
                        case 'add':
                            {

                                const newUsers: User[] = [];
                                // sync users
                                for (const member of group.members) {
                                    const user = await db.get('contacts', member);
                                    if (!user) {
                                        const newUser = await this.getUser();
                                        if (!newUser) return;
                                        const dbUser = new User({
                                            ...newUser,
                                            status: UserStatus.UNKNOWN
                                        })
                                        newUsers.push(dbUser);
                                        await db.put('contacts', dbUser, newUser.username);
                                    }
                                }
                                message = new Message(msg);
                                if (!chat) {
                                    message.text = "You are added to the group";
                                } else {
                                    const newMember = newUsers.map(x => x.name).join(', ');
                                    message.text = `${newMember} are added to group`;
                                }
                            }

                            break;
                        case 'remove':
                            {
                                const existingUsers = (chat?.users)||[];
                                const newUsers = group.members;
                                const removedUsers = existingUsers.filter(x => newUsers.indexOf(x) == -1);
                                const users:string[] = [];
                                for (const removedUser of removedUsers) {
                                    if(removedUser == currentUser.username){
                                        users.push("You");
                                        continue;
                                    }
                                    const user = await this.getUserByUsername(removedUser);
                                    users.push(user.name);
                                }
                                message = new Message(msg);
                                message.text = `${users.join(',')} has been removed`;
                            }
                            break;
                    }
                    if (message) {
                        this.newMessageEvent.emit(message);
                    }
                }
                break;
            default:
                break;
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
        await this.syncGroupsFromRemote();
    }

    private async delay(ms: number) {
        return new Promise((resolve, _) => {
            setTimeout(resolve, ms);
        });
    }

    private get uniqueId() {
        return ++this._uniqueId;
    }

    private async addMessageToDb(msg: Message) {

        if (!this.user) {
            console.error('User not loggedIn');
            return;
        }
        const db = this.chatDbConnector.db;
        if (!db) {
            console.error('Chatdb is undefined');
            return;
        }

        await db.add('messages', msg);

        const patnerUsername = msg.from == this.user.username ? msg.chatId : msg.from;

        let patner = await this.getUserByUsername(patnerUsername);

        patner.status = patner.status == undefined ? UserStatus.UNKNOWN : patner.status;

        let chat = await db.get('chat', msg.chatId)
        if (!chat) {
            chat = new Chat({
                type: ChatType.PERSONAL,
                id: msg.chatId,
                users: [this.user.username, patner.username],
                name: patner.name
            });
            await db.add('chat', chat);
        }
        const contact = await db.get('contacts', patner.username);
        if (!contact) {
            await this.addContact(patner);
        }

    }

    private async sendMessageToRemote(msg: Message) {
        let retry = 0;
        let result = -1;
        while (result != 0 && retry < 3) {
            result = this._socket.send({ msgId: msg.msgId, to: msg.chatId, text: msg.text });
            if (result == -1) {
                const status = this._socket.reconnect()
                if (status == 0) {
                    retry++;
                    await this.delay(100);
                }
            }
        }
    }

    private async searchUserFromRemote(searchText: string): Promise<User[]> {
        return await fetch(`/profile/search?q=${searchText}`)
            .then(resp => resp.json());
    }
    private async getContacts(searchText?: string) {
        let contactList = await this.chatDbConnector.db?.getAll('contacts')
        contactList = contactList?.filter(x => x.status != UserStatus.SELF);
        if (searchText) {
            contactList = contactList?.filter(x => {
                searchText = (searchText || '').toUpperCase();
                return (x.name.toUpperCase().indexOf(searchText) > -1 || x.username.toUpperCase().indexOf(searchText) > -1);
            });
        }
        return contactList;
    }

    private async syncGroupsFromRemote() {
        const groups: { groupId: string, name: string, members: string[] }[] = await fetch('/group/get')
            .then(res => res.json());
        const db = this.chatDbConnector.db;
        if (!db) return null;
        const promises: Promise<string>[] = [];
        groups.forEach(group => {
            const chat = new Chat({
                id: group.groupId,
                name: group.name,
                users: group.members,
                type: ChatType.GROUP
            });
            const promise = db.put('chat', chat, group.groupId);
            promises.push(promise);
        });
        return await Promise.all(promises);

    }

    private async getGroupById(groupId: string): Promise<{ groupId: string, members: string[], name: string }> {
        return fetch(`/group/${groupId}`)
            .then(res => res.json());
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

    async connect(dbOnly: Boolean = false) {
        await this.chatDbConnector.connect();
        if (dbOnly) return;
        await new Promise((resolve, reject) => {
            this._socket.connect();
            this._socket.onConnect = resolve;
            this._socket.onError = reject;
        })
        this._socket.onError = undefined;
    }

    async addContact(contact: User) {
        contact.status = contact.status ?? UserStatus.FRIEND;
        await this.chatDbConnector.db?.add('contacts', contact)
    }

    async getChats() {
        const user = this.user;
        if (!user) {
            console.error("User is not loggedIn")
            return;
        }
        const db = this.chatDbConnector.db;
        if (!db) {
            console.error("Db is not defined");
            return;
        }
        const chats = (await db.getAll('chat')) || [];
        const chatDict: Map<string, ChatViewModel> = new Map<string, ChatViewModel>()
        //const chatOrder = [];
        if (chats.length) {
            let cursor = await db.transaction('messages', 'readonly')
                .store.index('by-ts')
                .openCursor(undefined, 'prev');
            const users: Set<string> = new Set<string>();
            while (cursor) {
                const chatId = cursor.value.chatId;
                let chatVM = chatDict.get(chatId);
                if (!chatVM) {
                    let chat = chats.find(x => x.id == chatId);
                    if (!chat) continue;
                    chatVM = new ChatViewModel(chat);
                    chatDict.set(chatId, chatVM);
                    chatVM.users.forEach((val: string) => users.add(val));
                }
                chatVM.messages.push(cursor.value);
                cursor = await cursor.continue();
            }
            const usersProfile: Map<string, User> = new Map<string, User>();
            for (const u of users) {
                const userProfile = await this.getUserByUsername(u)
                usersProfile.set(u, userProfile);
            }

            chatDict.forEach(async (value: ChatViewModel) => {
                value.messages = value.messages.reverse();
                value.users.forEach(x => {
                    const user = usersProfile.get(x);
                    if (!user) return;
                    value.usersProfile.set(x, user);
                });
            })

        }

        return chatDict;
    }

    async sendMessage(message: { to: string, text: string }) {
        if (!this.user) return;

        const msgId = `${this.user.username}_${this.uniqueId}`;
        const db_msg = new Message({
            msgId: msgId,
            from: this.user.username,
            text: message.text,
            chatId: message.to,
            to: message.to,
            status: MessageStatus.READ,
            self: true,
            ts: Date.now()
        });
        await this.addMessageToDb(db_msg);
        await this.sendMessageToRemote(db_msg)
    }


    async getMessages(chatId: string) {
        const messages = (await this.chatDbConnector.db?.getAllFromIndex('messages', 'by-chatId', chatId)) || [];
        return messages.sort((a: Message, b: Message) => a.ts - b.ts);
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

    async signup(value: { username: string, name: string, psw: string }) {
        const resp = await fetch('/register', {
            method: 'post',
            body: JSON.stringify({ username: value.username, name: value.name, secretPhase: value.psw }),
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

    async getUserByUsername(username: string) {
        let user: User | undefined = await this.chatDbConnector.db?.get('contacts', username);
        if (user) {
            return user;
        }
        user = await fetch(`/profile/get?username=${username}`)
            .then(res => res.json());
        return new User(user);
    }
    async searchUsers(searchText: string) {
        const localSearchPromise = this.getContacts(searchText);
        let serverSearchPromise = null;
        if (searchText.length > 4) {
            serverSearchPromise = this.searchUserFromRemote(searchText)
        }
        const localContacts = (await localSearchPromise) || [];
        let serverContacts: User[];
        try {
            serverContacts = (await serverSearchPromise) || [];
        } catch (err) {
            serverContacts = [];
        }
        const localUsernames = localContacts.map(x => x.username);
        const uniqueServerContacts = serverContacts
            .filter(x => localUsernames.indexOf(x.username) == -1);
        let contacts = [...localContacts, ...uniqueServerContacts];
        return contacts;
    }

    async createGroup(payload: { name: string, members: string[] }) {
        const user = this.user;
        if (!user) return;
        payload.members = Array.from(new Set([user.username, ...payload.members]));
        const { groupId } = await fetch('/group/create', {
            method: 'post',
            body: JSON.stringify(payload),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(res => res.json())
            .then(res => {
                console.log(res);
                return res;
            });
        const newChat = new Chat({
            id: groupId,
            type: ChatType.GROUP,
            name: payload.name,
            users: payload.members
        });
        const db = this.chatDbConnector.db;
        if (!db) {
            return newChat;
        }
        await db.add('chat', newChat);
        return newChat;
    }
}
