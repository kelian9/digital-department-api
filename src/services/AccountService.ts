import { Request, Response } from "express";
import crypto from "crypto";
import Users from "../models/Users/Users";
import IRegistrationReq from "../controllers/accountController/IRegistrationReq";
import ErrorResponse from "../controllers/ErrorResponse";
import bcrypt from "bcrypt";
import tokenKey from "../controllers/tokenKey";
import IUser from "../models/Users/IUser";

const validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

class AccountService {
    constructor() {}

    // authentication
    public static async signIn(req: Request, res: Response) {
        const incorrectError = new ErrorResponse(400, '', 'Incorrect login or password')
        Users.findByLogin(req.body.login).then(result => {
            if (!result.length) {
                res.status(400).json(incorrectError);
                return;
            }
            const user: IUser = result[0];
            const validPassword = bcrypt.compareSync(req.body.password, user.password);
            if (validPassword) {
                let head = Buffer.from(
                    JSON.stringify({ alg: 'HS256', typ: 'jwt' })
                ).toString('base64');
                let body = Buffer.from(JSON.stringify(user)).toString('base64');
                let signature = crypto
                    .createHmac('SHA256', tokenKey)
                    .update(`${head}.${body}`)
                    .digest('base64');
        
                return res.status(200).json({
                    user: {
                        id: user.id,
                        role: user.role,
                        name: user.name,
                        login: user.login,
                        email: user.email,
                        birthDate: user.birthdate,
                        gender: user.gender,
                        career: user.career,
                        post: user.post,
                        canPublish: user.canpublish,
                        creationDate: user.creationdate,
                    },
                    token: `${head}.${body}.${signature}`,
                });
            } else {
                res.status(400).json(incorrectError);
            }
        }).catch(err => {
            res.status(500).json(new ErrorResponse(500, 'Server error', err))
        })
    }

    // create new client
    public static signUp(req: Request<any, IRegistrationReq>, res: Response) {
        if (Object.keys(req.body).length) {
            // Validate by required fields
            if (req.body.name < 2 || req.body.name > 60) {
                const nameError = new ErrorResponse(400, '', 'Length of name must be more than 2 and less than 60');
                res.status(400).json(nameError);
            }
            if (req.body.login < 6 || req.body.login > 40) {
                const loginError = new ErrorResponse(400, '', 'Length of login must be more than 5 and less than 40');
                res.status(400).json(loginError);
            }
            if (req.body.password < 6) {
                const passwordError = new ErrorResponse(400, '', 'Length of password must be more than 5');
                res.status(400).json(passwordError);
            }
            if (!validateEmail(req.body.email)) {
                const emailError = new ErrorResponse(400, '', 'Check your email address');
                res.status(400).json(emailError);
            }

            req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync());
            req.body.gender = !req.body.gender ? 'female' : 'male';
            Users.createUser(req.body)
                .then((result) => res.status(200).end())
                .catch((err: any) => {
                    if (err.detail) {
                        if ((err.detail as any).includes('Key (email)=') && (err.detail as any).includes(' already exists.')) {
                            res.status(400).json(new ErrorResponse(400, '', 'User with that email already exists.'));
                            return;
                        }
                        if (
                            (err.detail as any).includes('Key (login)=') || (err.detail as any).includes('Key (password)=')
                            && (err.detail as any).includes(' already exists.')
                        ) {
                            res.status(400).json(new ErrorResponse(400, '', 'This login or password already exists.'));
                            return;
                        }
                        res.status(400).json(new ErrorResponse(400, '', err.detail));
                        return;
                    }
                    res.status(500).json(new ErrorResponse(500, '', err))
                });
        } else {
            const error = new ErrorResponse(400, '', 'Empty body');
            res.status(400).json(error)
        }
    }

    public static editProfile(req: Request, res: Response) {
        if (req.body.name < 2 || req.body.name > 60) {
            const nameError = new ErrorResponse(400, '', 'Length of name must be more than 2 and less than 60');
            res.status(400).json(nameError);
        }
        if (req.body.login < 6 || req.body.login > 40) {
            const loginError = new ErrorResponse(400, '', 'Length of login must be more than 5 and less than 40');
            res.status(400).json(loginError);
        }
        if (!validateEmail(req.body.email)) {
            const emailError = new ErrorResponse(400, '', 'Check your email address');
            res.status(400).json(emailError);
        }
        Users.editUser((req as any).user.id, req.body)
            .then((result) => {
                return res.status(200).end();
            })
            .catch(err => {
                console.log(err);
                if ((err.detail as any).includes('Key (email)=') && (err.detail as any).includes(' already exists.')) {
                    res.status(400).json(new ErrorResponse(400, '', 'User with that email already exists.'));
                    return;
                }
                if ((err.detail as any).includes('Key (login)=') && (err.detail as any).includes(' already exists.')) {
                    res.status(400).json(new ErrorResponse(400, '', 'This login already exists.'));
                    return;
                }
                res.status(500).json(new ErrorResponse(500, '', err))
            });
    }
}

export default AccountService;
