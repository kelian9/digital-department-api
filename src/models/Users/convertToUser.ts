const convertToUser = (row: any) => {
    let user: any = {};
    Object.entries(row).forEach(([key, value]: [string, any]) => {
        const keyParts: string[] = key.split('_').map((part: string, index: number) => {
            if (index > 0) return part[0].toUpperCase() + part.slice(1);
            return part;
        });
        user[keyParts.join('') as string] = value;
    });
    return user;
};

export default convertToUser;
