import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import AccountService from "../../services/AccountService";
import AuthService from "../../services/AuthService";

const accountController: Router = express.Router();

accountController.post('/sign-in', (req:Request, res: Response, next: NextFunction) => {

    AccountService.signIn(req, res);
    // #swagger.description = 'Authentication'
    /* #swagger.responses['200'] = {
        // описание ответа
        description: 'authorize',
        schema: { $ref: "#/definitions/SignInResponse" }
    } */
});
accountController.post('/sign-up', (req:Request, res: Response, next: NextFunction) => {
    // возвращаемый ответ
    // #swagger.description = 'Registration'
    /*
        #swagger.responses['200'] = {
        // описание ответа
        'description': 'registration',
    } */

    AccountService.signUp(req, res)
});
accountController.use('/edit', AuthService.requireAuthorize);
accountController.put('/edit', (req:Request, res: Response, next: NextFunction) => {
    // #swagger.description = 'Edit your account'
    /* #swagger.requestBody = {
              required: true,
              content: {
                  "application/json": {
                      schema: { $ref: "#/definitions/EditAccountReqBody" },
                  }
              }
          }
        */
    /* #swagger.responses['200'] = {
        'description': 'authorize',
        'schema': { $ref: '#/definitions/SignInResponse' }
    } */
    /* #swagger.security = [{
        "bearerAuth": []
    }] */

    AccountService.editProfile(req, res)
});

export default accountController;
