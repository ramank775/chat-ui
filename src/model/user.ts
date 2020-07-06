
export enum UserStatus {
    SELF = -1,
    FRIEND = 0,
    UNKNOWN = 1
}

export class User { 
    name: string;
    username: string; 
    profile_img: string; 
    status: UserStatus

    constructor(user:any) {
        this.name = user.name;
        this.username = user.username;
        this.profile_img = user.profile_img;
        this.status = user.status
    }
}