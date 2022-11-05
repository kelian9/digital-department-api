interface IUser {
    id: number;
    role: number;
    name: string;
    login: string;
    password: string;
    email: string;
    birthDate: string | Date;
    gender: boolean;
    career: string;
    post: string;
    canPublish: boolean;
    creationDate: Date | string;
}

export default IUser;