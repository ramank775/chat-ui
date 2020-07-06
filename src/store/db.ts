import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Chat, User, Message } from "../model";
const DBInfo: { name: string, version: number } = {
    name: 'Chat',
    version: 1
};

interface ChatDBSchema_v1 extends DBSchema {
    contacts: {
        key: string,
        value: User
    },
    chat: {
        key: string,
        value: Chat
    },
    messages: {
        key: string,
        value: Message,
        indexes: { 'by-chatId': string, 'by-status': number, 'by-ts': number }
    }
}

declare type ChatDBSchema = ChatDBSchema_v1;

export class ChatDB {
    private _db?: IDBPDatabase<ChatDBSchema>;

    public async connect(): Promise<void> {
        this._db = await openDB<ChatDBSchema>(DBInfo.name, DBInfo.version, {
            upgrade(db: IDBPDatabase<ChatDBSchema>) {
                db.createObjectStore('contacts', { keyPath: 'username' });

                db.createObjectStore('chat', { keyPath: 'id' })

                const messages = db.createObjectStore('messages', { keyPath: 'msgId' });
                messages.createIndex('by-chatId', 'to');
                messages.createIndex('by-status', 'status');
                messages.createIndex('by-ts', 'ts');
            }
        });
    }
    public get db(): IDBPDatabase<ChatDBSchema> | undefined {
        return this._db;
    }
}
