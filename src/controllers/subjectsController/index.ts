import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import AuthService from "../../services/AuthService";
import SubjectsService from "../../services/SubjectsService";

const subjectsController: Router = express.Router();

subjectsController.get('/filter', (req:Request, res: Response, next: NextFunction) => {
    // #swagger.description = 'Get subjects'
    /* #swagger.responses['200'] = {
        'description': 'filtered subjects',
        'schema': { $ref: '#/definitions/SignInResponse' }
    } */

    SubjectsService.filter(req, res)
});

subjectsController.post('/create', (req:Request, res: Response, next: NextFunction) => {
    // #swagger.description = 'Create subject'
    /* #swagger.responses['200'] = {
        'description': 'Is subject created',
        'schema': { $ref: '#/definitions/SignInResponse' }
    } */

    SubjectsService.create(req, res)
});

subjectsController.use('/delete', AuthService.authorizeAdmin);
subjectsController.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) => {
    SubjectsService.delete(req, res);
})

export default subjectsController;
