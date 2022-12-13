import { Pool, PoolClient } from "pg";

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'digital-department',
    password: '230691as',
    port: 5432,
};

class Db {
    static pool: PoolClient;

    public static async query<I>(text: string, params?: I[] | any[]) {
        const start = Date.now();
        const pool = new Pool(dbConfig);
        return pool.query(text, params).then(async (res) => {
            const duration = Date.now() - start;
            console.log('executed query', { text, duration, rows: res.rowCount });
            pool.end();
            return res;
        });
    }

    public static async transaction<I>(text: string, params?: I[] | any[]) {
            if (!this.pool) this.pool = await new Pool(dbConfig).connect();
            const start = Date.now();
            return this.pool.query(text, params).then(async (res) => {
                const duration = Date.now() - start;
                console.log('executed query', { text, duration, rows: res.rowCount });
                return res;
            });
    }
}

export default Db;