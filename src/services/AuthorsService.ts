import { Request, Response } from "express";
import ErrorResponse from "../controllers/ErrorResponse";
import Authors from "../models/Authors";
import IAuthor from "../models/Authors/IAuthor";

class AuthorsService {
    constructor() {}

    // filtration
    public static async filter(req: Request, res: Response) {
        Authors.getAuthors((req.query as any).name).then((result: IAuthor[]) => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async create(req: Request, res: Response) {
        Authors.create(req.body.name).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async delete(req: Request, res: Response) {
        Authors.delete(Number(req.params.id)).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        })
    }
}

export default AuthorsService;
