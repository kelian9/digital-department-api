import { Request, Response } from "express";
import ErrorResponse from "../controllers/ErrorResponse";
import Comments from "../models/Comments";

class CommentsService {
    constructor() {}

    // authentication
    public static async getByPublicationId(req: Request, res: Response) {
        Comments.getByPublicationId(
            Number(req.params.publicationId),
            Number(req.query.page),
            Number(req.query.pageSize)
        ).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async create(req: Request, res: Response) {
        Comments.create((req as any).user.id, req.body).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async deleteComment(req: Request, res: Response) {
        Comments.delete(Number(req.params.id)).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }
}

export default CommentsService;
