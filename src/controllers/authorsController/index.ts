import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import AuthorsService from "../../services/AuthorsService";
import AuthService from "../../services/AuthService";

const authorsController: Router = express.Router();

authorsController.get('/filter', (req:Request, res: Response, next: NextFunction) => {
    // #swagger.description = 'Get authors'
    /* #swagger.responses['200'] = {
        'description': 'filtered authors',
        'schema': { $ref: '#/definitions/SignInResponse' }
    } */

    AuthorsService.filter(req, res)
});

authorsController.post('/create', (req:Request, res: Response, next: NextFunction) => {
    // #swagger.description = 'Create author'
    /* #swagger.responses['200'] = {
        'description': 'Is author created',
        'schema': { $ref: '#/definitions/SignInResponse' }
    } */

    AuthorsService.create(req, res)
});

authorsController.use('/delete', AuthService.authorizeAdmin);
authorsController.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) => {
    AuthorsService.delete(req, res);
})

export default authorsController;
