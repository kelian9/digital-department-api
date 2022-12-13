import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import AuthService from "../../services/AuthService";
import multer from 'multer';
import path from "path";
import CommentsService from "../../services/CommentsService";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname + '../../../uploads'));
    },
    filename: function (req, file, cb) {
        console.log(Buffer.from(file.originalname, 'utf-8').toString());
        const extension = file.mimetype.split('/')[1];
        const dateField = (new Date().getTime() / 1000 | 0);
        const randomField = Math.random().toString(36).substring(2);
        const fileName = `${dateField}-${randomField}.${extension}`;
        req.body[file.fieldname] = req.body[file.fieldname]
            ? [...req.body[file.fieldname], {
                extension,
                name: Buffer.from(file.originalname, 'utf-8').toString(),
                path: fileName,
            }]
            : [{
                extension,
                name: Buffer.from(file.originalname, 'utf-8').toString(),
                path: fileName,
            }];
        cb(null, fileName);;
    }
});
  
const upload = multer({ storage: storage })

const commentsController: Router = express.Router();

commentsController.get('/:publicationId', (req:Request, res: Response, next: NextFunction) => {
    CommentsService.getByPublicationId(req, res)
});

commentsController.use('/create', AuthService.requireAuthorize);
commentsController.post(
    '/create',
    upload.fields([
        {
            name: 'assets',
            maxCount: 5
        }
    ]),
    (req:Request, res: Response, next: NextFunction) => {
        CommentsService.create(req, res);
    }
);

commentsController.use('/delete', AuthService.authorizeAdmin);
commentsController.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) => {
    CommentsService.deleteComment(req,res);
})

export default commentsController;
