import { Request, Response } from "express";
import ErrorResponse from "../controllers/ErrorResponse";
import Publications from "../models/Publications";

class FavouritesService {
    constructor() {}

    // authentication
    public static async getFavourites(req: Request, res: Response) {
        Publications.getFavouritesByUserId(
            (req as any).user.id,
            {
                page: Number(req.query.page),
                pageSize: Number(req.query.pageSize)
            }
        ).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async updateFavourite(req: Request, res: Response) {
        if (!req.params.id) {
            res.status(400).json('Incorrect publication id');
            return;
        }
        Publications.updateFavourite((req as any).user.id, Number(req.params.id))
            .then(result => {
                res.status(200).json(true);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
}

export default FavouritesService;
