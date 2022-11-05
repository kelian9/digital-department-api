import { QueryResult } from "pg";

interface IDatabase {
    query: <I>(text: string, params?: I[] | any[]) => Promise<QueryResult<any>>;
}

export default IDatabase;
