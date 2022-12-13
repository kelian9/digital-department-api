import { join, dirname } from 'path';
import swaggerAutogen from 'swagger-autogen';

const _dirname = dirname(join(__dirname, '/swagger'));

const doc = {
    // общая информация
    info: {
      title: 'Digital Department API',
      description: ''
    },
    // что-то типа моделей
    definitions: {
      // модель задачи
      Todo: {
        id: '1',
        text: 'test',
        done: false
      },
      // модель массива задач
      Todos: [
        {
          // ссылка на модель задачи
          $ref: '#/definitions/Todo'
        }
      ],
      User: {
        id: 1,
        role: 0,
        name: 'Name',
        login: 'login',
        email: 'email@kai.ru',
        birthDate: '2000-02-02T15:00:00Z',
        gender: 'female' || 'male',
        canPublish: true,
        creationDate: '2022-11-11T15:00:00Z',
      },
      EditAccountReqBody: {
        name: 'Name',
        login: 'login',
        email: 'email@kai.ru',
        birthDate: '2000-02-02T15:00:00Z',
        gender: 'female' || 'male',
        career: 'university',
        post: 'engineer',
      },
      SignInResponse: {
        user: { $ref: '#/definitions/User' },
        token: 'Bearer token',
      },
      SignInReqBody: {
        login: 'string',
        password: 'string',
      },
      SignUpReqBody: {
        name: 'string',
        login: 'string',
        email: 'string',
        password: 'string',
        birthDate: '31.08.2001T12:00:00',
        gender: 0,
        career: 'string',
        post: 'string',
      },
      Author: {
        id: 1,
        name: 'string',
      },
      Subject: {
        id: 1,
        name: 'string',
      },
      Tag: {
        id: 1,
        name: 'string',
      },
      Publication: {        
        id: 1,
        userId: 1,
        type: 0,
        status: 1,
        title: 'string',
        review: 'string',
        coverPath: 'string',
        filePath: 'string',
        authors: [{ $ref: '#/definitions/Author' }],
        subjects: [{ $ref: '#/definitions/Subject' }],
        tags: [{ $ref: '#/definitions/Tag' }],
        releaseDate: '19.02.1968T12:00:00',
        creationDate: '19.02.1968T12:00:00'
      },
      Publications: [{
        $ref: '#/definitions/Publication'
      }]
    },
    host: 'localhost:3000',
    schemes: ['http'],
    securityDefinitions: {
      bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          scheme: 'bearer',
          bearerFormat: 'JWT'
      },
    }
}

// путь и название генерируемого файла
const outputFile = join(_dirname, 'output.json');
// массив путей к роутерам
const routersPaths = [
    '../index.ts',
    '../controllers/accountController/index.ts',
    '../controllers/usersController/index.ts',
    '../controllers/publicationsController/index.ts',
];
const getEndpoints = () => {
    return routersPaths.map((path) => join(_dirname, path));
};
const endpointsFiles = getEndpoints();

swaggerAutogen(/*options*/)(outputFile, endpointsFiles, doc).then((res) => {
    console.log(`Generated: ${(res as {
        success: boolean;
        data: any;
    }).success}`);
});

export default {};