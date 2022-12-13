interface IUser {
    id: number;
    role: number;
    name: string;
    login: string;
    password: string;
    email: string;
    birthdate: string | Date;
    gender: boolean;
    career: string;
    post: string;
    canpublish: boolean;
    creationdate: Date | string;
}

export interface IUserAccount {
    id: number;
    role: number;
    name: string;
    login: string;
    email: string;
    birthDate: string | Date;
    gender: boolean;
    career: string;
    post: string;
    canPublish: boolean;
    creationDate: Date | string;
}

export default IUser;
