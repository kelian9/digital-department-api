import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
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