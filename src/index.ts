import express, {Request,Response,Application, NextFunction} from 'express';
import accountController from './controllers/accountController';
import usersController from './controllers/usersController';
import AuthService from './services/AuthService';
import ErrorResponse from './controllers/ErrorResponse';
import cors from 'cors';
import { readFileSync } from 'fs'
import swaggerUi from 'swagger-ui-express';
import publicationsController from './controllers/publicationsController';
import authorsController from './controllers/authorsController';
import tagsController from './controllers/tagsController';
import subjectsController from './controllers/subjectsController';
import path from 'path';
import commentsController from './controllers/commentsController';
import favouritesController from './controllers/favouritesController';
import feedbacksController from './controllers/feedbacksController';
import host from './urlEndPoint';

const app: Application = express();
const PORT = process.env.PORT || 3000;

const swaggerFile = JSON.parse(readFileSync('./src/swagger/output.json', 'utf8'))

function notFound(res: any) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found\n');
}

app.use(cors());

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(express.json());

app.use((req,res,next) => {
    // console.log(req.path);
    next();
})

app.use("/account", accountController);
app.use("/publications", publicationsController);
app.use("/comments", commentsController);
app.use("/authors", authorsController);
app.use("/tags", tagsController);
app.use("/subjects", subjectsController);
app.use("/feedbacks", feedbacksController);

app.get("/download/:filePath/:fileName", (req, res) => { 
    const filePath = path.join(__dirname, "uploads", req.params.filePath);
    const dotPosition: number = req.params.filePath.lastIndexOf('.');
    const extension = req.params.filePath.slice(dotPosition);
    console.log(filePath, req.params.fileName.includes('.') ? req.params.fileName : req.params.fileName + extension)
    res.download(
        filePath, 
        req.params.fileName.includes('.') ? req.params.fileName : req.params.fileName + extension, // Remember to include file extension
        (err) => {
            if (err) {
                res.json({
                    error: err,
                    msg: "Problem downloading the file"
                })
            }
    });
});

app.use(AuthService.requireAuthorize);
app.use("/favourites", favouritesController);

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
