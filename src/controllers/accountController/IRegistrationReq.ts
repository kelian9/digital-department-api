interface IRegistrationReq {
    name: string;
    login: string;
    password: string;
    email: string;
    birthDate: Date | string;
    gender: string;
    career: string;
    post: string;
}

export default IRegistrationReq;
