import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import tokenKey from "../controllers/tokenKey";
import ErrorResponse from "../controllers/ErrorResponse";

class AuthService {
    constructor() {}

    public static authorize(req:Request, res: Response, next: NextFunction) {
        // console.log(req.headers.authorization);
        if (req.headers.authorization) {
            let tokenParts = req.headers.authorization
                .split(' ')[1]
                .split('.');
            let signature = crypto
                .createHmac('SHA256', tokenKey)
                .update(`${tokenParts[0]}.${tokenParts[1]}`)
                .digest('base64');
        
            if (signature === tokenParts[2])
                (req as any).user = JSON.parse(
                    Buffer.from(tokenParts[1], 'base64').toString(
                        'utf8'
                    )
                );
            next();
            return;
        }

        next();
    }

    public static requireAuthorize(req:Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            res.status(401).json('Unauthorized');
            return;
        }
        AuthService.authorize(req, res, next);
    }

    public static authorizeAdmin(req:Request, res: Response, next: NextFunction) {
        if (req.headers.authorization) {
            let tokenParts = req.headers.authorization
                .split(' ')[1]
                .split('.');
            let signature = crypto
                .createHmac('SHA256', tokenKey)
                .update(`${tokenParts[0]}.${tokenParts[1]}`)
                .digest('base64');
        
            if (signature === tokenParts[2]) {
                const user = JSON.parse(
                    Buffer.from(tokenParts[1], 'base64').toString(
                        'utf8'
                    )
                );
                if (user.role && Number(user.role) === 0) {
                    res.status(403).json(new ErrorResponse(403, 'Forbidden', 'You have no permissions'));
                    return;
                }
                (req as any).user = user;
            }
            next();
            return;
        }

        next();
    }
}

export default AuthService;
