import { Request, Response } from "express";
import ErrorResponse from "../controllers/ErrorResponse";
import Feedbacks from "../models/Feedbacks";

class FeedbacksService {
    constructor() {}

    // authentication
    public static async getFeedbacks(req: Request, res: Response) {
        Feedbacks.getFeedbacks(Number(req.query.page), Number(req.query.pageSize))
            .then(result => {
                res.status(200).json(result);
            }).catch(err => {
                console.log(err);
                res.status(500).json(new ErrorResponse(500, 'Server error', err));
            });
    }

    public static async create(req: Request, res: Response) {
        Feedbacks.create(req.body).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async deleteComment(req: Request, res: Response) {
        Feedbacks.delete(Number(req.params.feedbackId)).then(result => {
            res.status(200).json(true);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }
}

export default FeedbacksService;
