import { Request, Response } from "express";
import ErrorResponse from "../controllers/ErrorResponse";
import IUsersFilter from "../models/Users/IUsersFilter";
import Users from "../models/Users/Users";

class UsersService {
    constructor() {}

    public static async filterUsers(req: Request<IUsersFilter>, res: Response) {
        Users.getUsers(Object.keys(req.query).length ? req.query : undefined)
            .then((result) => {
                return res.status(200).json(result);
            })
            .catch(err => {
                return res.status(500).json(new ErrorResponse(500, '', err));
            });
    }
}

export default UsersService;
