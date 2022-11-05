import IEditAccountReqBody from "../../controllers/accountController/IEditAccountReqBody";
import IRegistrationReq from "../../controllers/accountController/IRegistrationReq";
import db from "../../db";
import convertToUser from "./convertToUser";
import IUsersFilter from "./IUsersFilter";

class Users {
    constructor() {}

    public static findByLogin(login: string) {
        return db.query('SELECT * FROM users u WHERE u.login = $1 OR u.email = $1', [login])
            .then((res) => {
                return res.rows;
            })
    }

    public static getUsers(filter?: IUsersFilter) {
        const params = filter ? Object.values(filter).map((v) => `%${v}%`) : null;
        const filterPartOfQuery = filter
            ? Object.keys(filter).map((key, index, keysArr) => {
                return `LOWER(u.${key}) LIKE $${index + 1}`;
            }).join(' AND ')
            : null;

        return (params
            ? db.query(`
                SELECT id, role, name, login, email, birthdate as birth_date, gender, career,
                    post, canpublish as can_publish, creationdate as creation_date
                FROM users u WHERE ${filterPartOfQuery}`, params)
            : db.query(`
                SELECT id, role, name, login, email, birthdate as birth_date, gender, career,
                    post, canpublish as can_publish, creationdate as creation_date
                FROM users`)
            ).then((result) => {
                return result.rows.map((row) => convertToUser(row));
            })
    }

    public static createUser(body: IRegistrationReq) {
        const params = Object.values(body);
        const attributes = Object.keys(body);
        const values = params.map((item, index) => `$${index + 1}`);

        return db.query(`
            INSERT INTO users (role, canpublish, ${attributes.join(', ')}) VALUES (0, true, ${values.join(', ')})
        `, params).then(res => res);
    }

    public static editUser(id: number, body: IEditAccountReqBody) {
        const params = Object.values(body);
        const attributes = Object.keys(body);
        const values = params.map((item, index) => `$${index + 1}`);

        return db.query(`
            UPDATE users u SET (${attributes.join(',')}) = (${values}) WHERE u.id = ${id}
        `, params).then(res => res);
    }
}

export default Users;
