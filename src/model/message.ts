import { User } from './user';

export enum MessageStatus {
    READ = 0,
    UNREAD = 1
}


export class Message {
    msgId: string;
    from: string;
    text: string;
    chatId: string;
    status: MessageStatus;
    self: boolean;
    ts: number;
    constructor(msg: Message) {
        this.msgId = msg.msgId;
        this.from = msg.from;
        this.text =msg.text;
        this.chatId = msg.chatId;
        this.status = msg.status;
        this.self = msg.self;
        this.ts = msg.ts||Date.now();
    }
}