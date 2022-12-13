import { Request, Response } from "express";
import ErrorResponse from "../controllers/ErrorResponse";
import Subjects from "../models/Subjects";

class SubjectsService {
    constructor() {}

    // filtration
    public static async filter(req: Request, res: Response) {
        Subjects.getSubjects((req.query as any).name).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async create(req: Request, res: Response) {
        Subjects.create(req.body.name).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async delete(req: Request, res: Response) {
        Subjects.delete(Number(req.params.id)).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        })
    }
}

export default SubjectsService;
