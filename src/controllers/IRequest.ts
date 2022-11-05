import { Request } from "express";
import * as core from 'express-serve-static-core';

interface IRequest<
P = core.ParamsDictionary,
ResBody = any,
ReqBody = any,
ReqQuery = core.Query,
Locals extends Record<string, any> = Record<string, any>
> extends Request {
    user: any;
}

export default IRequest;