import { Request, Response } from "express";
import ErrorResponse from "../controllers/ErrorResponse";
import Publications from "../models/Publications";
import EmailService from "./EmailService";

class PublicationsService {
    constructor() {}

    public static async filter(req: Request, res: Response) {
        Object.entries(req.query).forEach(([key, value]: [string, any]) => {
            req.query[key] = Array.isArray(value) ? value.map((v: string) => Number(v)) : value;
        })
        Publications.getPublications(req.query as any, (req as any).user?.id).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async search(req: Request, res: Response) {
        const query = (req.query as any);
        Publications.searchPublications(
            Number(query.page),
            Number(query.pageSize),
            query.substr?.toLowerCase() || '',
            (req as any).user?.id
        ).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async getById(req: Request, res: Response) {
        Publications.getById(Number(req.params.id), (req as any).user?.id).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        })
    }

    public static async create(req: Request, res: Response) {
        Publications.create((req as any).user.id, req.body).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.status(500).json(new ErrorResponse(500, 'Server error', err));
        });
    }

    public static async updateStatus(req: Request, res: Response) {
        const nextStatus: number = Number(req.body.status);
        const rejectReason: string | undefined  = req.body.reason;
        Publications.updateStatus(Number(req.body.id), Number(req.body.status))
            .then(result => {
                const mailData = {
                    to: result.email,
                    subject: `Публикация "${result.title}"`,
                    html: `
                        <img src="../static/logo.svg" alt="logotype" />
                        <h1 style="color: ${ nextStatus === 1 ? 'green' : 'red' };">
                            Администрация Digital Department рассмотрела ваш материал!
                        </h1>
                        <p>
                            ${nextStatus === 1
                                ? `
                                    Ваша публикация уже доступна для чтения. Можете ознакомиться по ссылке 
                                    <a href="http://localhost:8080/publications/${Number(req.body.id)}">
                                        ${result.title}
                                    </a>
                                `
                                : `
                                    К сожалению, публикация с id = ${req.body.id} не прошла проверку.
                                    ${rejectReason || ''}
                                `
                            }
                        </p>
                    `
                };
                EmailService.sendMail(mailData).then(info => {
                    res.status(200).json(true);
                }).catch(err => {
                    console.log(err);
                    res.status(500).json(err);
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
}

export default PublicationsService;
