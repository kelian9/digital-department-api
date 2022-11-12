import express, {Request,Response,Application, NextFunction} from 'express';
import accountController from './controllers/accountController';
import crypto from "crypto";
import IRequest from './controllers/IRequest';
import usersController from './controllers/usersController';
import AuthService from './services/AuthService';
import ErrorResponse from './controllers/ErrorResponse';
import cors from 'cors';
import { readFileSync } from 'fs'
import swaggerUi from 'swagger-ui-express';

const app: Application = express();
const PORT = process.env.PORT || 3000;

const host = '192.168.126.53';

const swaggerFile = JSON.parse(readFileSync('./src/swagger/output.json', 'utf8'))

function notFound(res: any) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found\n');
}

app.use(cors());

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.use(express.json());

app.use((req,res,next) => {
    console.log(req.path);
    next();
})

app.use("/account", accountController);
app.use(AuthService.authorize);

app.use("/admin", (req, res, next) => {
    (req as any).user.role === 1
        ? next()
        : res.status(403).json(new ErrorResponse(403, 'Forbidden', "You don't have permissions to access on this resource"));
});
app.use("/admin/users", usersController);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(Number(PORT), host, () => {
    console.log(`Server listens http://${host}:${PORT}`);
});
