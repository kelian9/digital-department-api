import express from "express";
import { Router } from "express-serve-static-core";
import AccountService from "../../services/AccountService";

const accountController: Router = express.Router();

accountController.post('/sign-in', AccountService.signIn);
accountController.post('/sign-up', AccountService.signUp);
accountController.put('/edit', AccountService.editProfile);

export default accountController;