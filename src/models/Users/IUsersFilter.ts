interface IUsersFilter {
    id?: number;
    name?: string;
    login?: string;
    email?: string;
    canPublish?: boolean;
    creationDate?: Date | string;
}

export default IUsersFilter;