import db from "../../db";
import IAuthor from "./IAuthor";

class Authors {
    constructor() {}

    public static getAuthors(name?: string) {
        const query = name
            ? db.query(`
                  SELECT id, name FROM authors a WHERE LOWER(a.name) LIKE $1
              `, ['%' + name?.toLowerCase() + '%']) 
            : db.query(`SELECT id, name FROM authors`)
        return query.then((result) => {
            return result.rows;
        });
    }

    public static getAuthorsByNames(names: string[]) {
        const query = names.length
            ? db.query(`
                  SELECT id, name FROM authors a WHERE ${names.map((name: string, index: number) => {
                    return `LOWER(a.name) = ${name}${index !== names.length - 1 ? ' OR' : ''}`
                  })}
              `) 
            : db.query(`SELECT id, name FROM authors`)
        return query.then((result) => {
            return result.rows;
        });
    }

    public static create(name: string) {
        return db.query(`INSERT INTO authors (name) VALUES ($1)`, [name]).then(result => {
            console.log(result);
            return result;
        })
    }

    public static createManyAuthors(notExistedAuthors: IAuthor[]) {
        return db.query(`
            BEGIN;
            ${notExistedAuthors.map(a => `INSERT INTO authors (name) VALUES (${a.name});`).join('')}
        `).then(result => {
            return result;
        });
    }

    public static delete(authorId: number) {
        return db.query(`
            WITH deleted_relations AS (DELETE FROM rel_authors r_a WHERE r_a.author_id = $1)
            DELETE FROM authors a WHERE a.id = $1;
        `, [authorId]).then(result => {
            return result;
        });
    }
}

export default Authors;
