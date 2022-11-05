import express from "express";
import { Router } from "express-serve-static-core";
import UsersService from "../../services/UsersService";

const usersController: Router = express.Router();

usersController.get('/', UsersService.filterUsers);

export default usersController;
