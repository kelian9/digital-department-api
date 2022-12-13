import express, { NextFunction, Request, Response } from "express";
import { Router } from "express-serve-static-core";
import FavouritesService from "../../services/FavouritesService";

const favouritesController: Router = express.Router();

favouritesController.put('/update/:id', (req:Request, res: Response, next: NextFunction) => {
    FavouritesService.updateFavourite(req, res);
});

favouritesController.get('/', (req:Request, res: Response, next: NextFunction) => {
    FavouritesService.getFavourites(req, res)
});

export default favouritesController;
