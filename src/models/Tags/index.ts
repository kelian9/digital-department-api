import db from "../../db";

class Tags {
    constructor() {}

    public static getTags(name?: string) {
        const query = name
            ? db.query(`
                  SELECT id, name FROM tags t WHERE LOWER(t.name) LIKE $1
              `, ['%' + name?.toLowerCase() + '%']) 
            : db.query(`SELECT id, name FROM tags`)
        return query.then((result) => {
            return result.rows;
        });
    }

    public static create(name: string) {
        return db.query(`INSERT INTO tags (name) VALUES ($1)`, [name]).then(result => {
            console.log(result);
            return result;
        })
    }

    public static delete(tagId: number) {
        return db.query(`
            WITH deleted_relations AS (DELETE FROM rel_tags r_t WHERE r_t.tag_id = $1)
            DELETE FROM tags t WHERE t.id = $1;
        `, [tagId]).then(result => {
            return result;
        });
    }
}

export default Tags;
