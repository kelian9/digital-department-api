import { Pool } from "pg";

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'digital-department',
    password: '230691as',
    port: 5432,
};

export default {
    query: async <I>(text: string, params?: I[] | any[]) => {
        const start = Date.now();
        const pool = new Pool(dbConfig);
        return pool.query(text, params).then(async (res) => {
            const duration = Date.now() - start;
            console.log('executed query', { text, duration, rows: res.rowCount });
            pool.end();
            return res;
        });
    },
};