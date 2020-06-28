import { ChatDB } from "./db";
import { Socket } from "./socket";

enum MessageStatus {
    READ = 0,
    UNREAD = 1
}

export class Store {
    private _socket: Socket;
    private chatDbConnector: ChatDB;
    private user: { username: string, name: string, profile_img: string };
    private _uniqueId: number;
    constructor(host: string) {
        this._socket = new Socket(host);
        this.chatDbConnector = new ChatDB();
        this._uniqueId = (new Date().getTime() * 10 + 1);
        this.user = this.getUser();
    }

    getUser() {
        return {
            username: '',
            name: '',
            profile_img: ''
        };
    }

    private get uniqueId() {
        return ++this._uniqueId;
    }

    async connect() {
        await this.chatDbConnector.connect();
        await new Promise((resolve, reject) => {
            this._socket.connect();
            this._socket.onConnect = resolve;
            this._socket.onError = reject;
        })
        this._socket.onError = undefined;
    }

    async getContacts(searchText?: string) {
        let contactList = await this.chatDbConnector.db?.getAll('contacts')
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

    async sendMessage(message: { to: string, text: string }) {
        const transcation = this.chatDbConnector.db?.transaction('messages', 'readwrite');
        if (!transcation) return;
        const msgId = `${this.user.username}_${this.uniqueId}`;
        const db_msg = {
            msgId: msgId,
            from: this.user.username,
            text: message.text,
            to: message.to,
            status: MessageStatus.READ
        };
        await transcation.store.add(db_msg);
        this._socket.send(db_msg);
        const chat = await transcation.db.get('chat', message.to)
        if (!chat) {
            await transcation.db.add('chat', { type: '1-1', id: message.to, users: [this.user.username, message.to] })
        }
        return transcation.done;
    }

    async getMessages(chatId: string) {
        await this.chatDbConnector.db?.getAllFromIndex('messages', 'by-chatId', chatId)
    }

    async newMessage(msg: { to: string, text: string, from: string, msgId: string }) {
        const db = this.chatDbConnector.db;
        if (!db) return;
        await db.add('messages', { ...msg, status: MessageStatus.UNREAD });
        const chat = await db.get('chat', msg.from);
        if (!chat) {
            await db.add('chat', { type: '1-1', id: msg.from, users: [this.user.username, msg.from] });
        }
    }

    async login(login: { username: string, password: string }) {
         fetch('/login', {
                method: 'post',
                body: JSON.stringify({
                    username: login.username,
                    secretPhase: login.password
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            }).then(res => res.json())
                .then(res => {
                    return res;
                })
    }

    async signup(value: { username: string, name: string, secretPhase: string }) {
        const resp = await fetch('/api/register', {
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
    }

    async validateUsername(username: string) {
        return await fetch('/api/exist', {
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

}
