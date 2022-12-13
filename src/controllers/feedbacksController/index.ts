import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import AuthService from "../../services/AuthService";
import FeedbacksService from "../../services/FeedbacksService";
  
const feedbacksController: Router = express.Router();

feedbacksController.get('/filter', (req:Request, res: Response, next: NextFunction) => {
    FeedbacksService.getFeedbacks(req, res)
});

feedbacksController.post('/create', (req:Request, res: Response, next: NextFunction) => {
    FeedbacksService.create(req, res);
});

feedbacksController.use('/delete', AuthService.requireAuthorize);
feedbacksController.delete('/delete/:feedbackId', (req: Request, res: Response, next: NextFunction) => {
    FeedbacksService.deleteComment(req,res);
})

export default feedbacksController;
