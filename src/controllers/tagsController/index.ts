import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import AuthService from "../../services/AuthService";
import TagsService from "../../services/TagsService";

const tagsController: Router = express.Router();

tagsController.get('/filter', (req:Request, res: Response, next: NextFunction) => {
    // #swagger.description = 'Get tags'
    /* #swagger.responses['200'] = {
        'description': 'filtered tags',
        'schema': { $ref: '#/definitions/SignInResponse' }
    } */

    TagsService.filter(req, res)
});

tagsController.post('/create', (req:Request, res: Response, next: NextFunction) => {
    // #swagger.description = 'Create tag'
    /* #swagger.responses['200'] = {
        'description': 'Is tag created',
        'schema': { $ref: '#/definitions/SignInResponse' }
    } */

    TagsService.create(req, res)
});

tagsController.use('/delete', AuthService.authorizeAdmin);
tagsController.delete('/delete/:id', (req: Request, res: Response, next: NextFunction) => {
    TagsService.delete(req, res);
})

export default tagsController;
