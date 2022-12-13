import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import AuthService from "../../services/AuthService";
import PublicationsService from "../../services/PublicationsService";
import multer from 'multer';
import path from "path";
import convertDjvuToPdf from "../../services/ConverterService";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname + '../../../uploads'));
    },
    filename: function (req, file, cb) {
        const extension = file.mimetype.split('/')[1];
        const dateField = (new Date().getTime() / 1000 | 0);
        const randomField = Math.random().toString(36).substring(2);
        const fileName = `${dateField}-${randomField}.${extension === 'octet-stream' ? 'djvu' : extension}`;
        req.body[file.fieldname] = fileName;
        cb(null, fileName);;
    }
});
  
const upload = multer({ storage: storage })

const publicationsController: Router = express.Router();

publicationsController.use('/filter', AuthService.authorize);
publicationsController.get('/filter', (req:Request, res: Response, next: NextFunction) => {

    PublicationsService.filter(req, res)
});

publicationsController.use('/search', AuthService.authorize);
publicationsController.get('/search', (req:Request, res: Response, next: NextFunction) => {
    PublicationsService.search(req, res)
});

publicationsController.use('/:id', AuthService.authorize);
publicationsController.get('/:id', (req:Request, res: Response, next: NextFunction) => {

    PublicationsService.getById(req, res)
});

publicationsController.use('/create', AuthService.requireAuthorize);
publicationsController.post(
    '/create',
    upload.fields([
        {
            name: 'cover',
            maxCount: 1
        },
        {
            name: 'file',
            maxCount: 1
        }
    ]),
    async (req:Request, res: Response, next: NextFunction) => {
        if (req.body.file.includes('.djvu')) {
            convertDjvuToPdf(req.body.file)
                .then((result) => {
                    req.body.file = result;
                    PublicationsService.create(req, res);
                }).catch((e) => {
                    console.error(e.toString());
                    res.status(500).json(e);
                    return;
                });
        } else {
            PublicationsService.create(req, res);
        }
    }
);

publicationsController.use('/update-status', AuthService.requireAuthorize);
publicationsController.put('/update-status', (req: Request, res: Response, next: NextFunction) => {
    PublicationsService.updateStatus(req, res);
});

export default publicationsController;
