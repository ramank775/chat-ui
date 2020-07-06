import { Message } from './message';
import { User } from './user';

export enum ChatType {
    PERSONAL = 1,
    GROUP = 2
}

export class Chat {
    type: ChatType;
    id: string;
    name: string;
    users: string[]
    constructor(chat: Chat) {
        this.type = chat.type;
        this.id = chat.id;
        this.users = chat.users
        this.name = chat.name;
    }
}

export class ChatViewModel extends Chat {
    messages: Message[] = [];
    usersProfile: Map<string, User> = new Map<string, User>()
    constructor(chat:Chat) {
        super(chat);
    }
}
