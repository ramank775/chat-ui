
export enum MessageStatus {
    READ = 0,
    UNREAD = 1
}


export class Message {
    msgId: string;
    to: string;
    from: string;
    text: string;
    chatId: string;
    status: MessageStatus;
    self: boolean;
    ts: number;
    constructor(msg: Message) {
        this.msgId = msg.msgId;
        this.to  = msg.to;
        this.from = msg.from;
        this.text =msg.text;
        this.chatId = msg.chatId;
        this.status = msg.status;
        this.self = msg.self;
        this.ts = msg.ts||Date.now();
    }
}

export class ServerMessage extends Message {
    category: string;
    module: string;
    action: string;

    constructor(msg: ServerMessage) {
        super(msg);
        this.category = msg.category;
        this.module = msg.module;
        this.action = msg.action;
    }
}
