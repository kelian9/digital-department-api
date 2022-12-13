import db from "../../db";

class Subjects {
    constructor() {}

    public static getSubjects(name?: string) {
        const query = name
            ? db.query(`
                  SELECT id, name FROM subjects s WHERE LOWER(s.name) LIKE $1
              `, [name?.toLowerCase()]) 
            : db.query(`SELECT id, name FROM subjects`)
        return query.then((result) => {
            return result.rows;
        });
    }
    
    public static create(name: string) {
        return db.query(`INSERT INTO subjects (name) VALUES ($1)`, [name]).then(result => {
            console.log(result);
            return result;
        })
    }

    public static delete(subjectId: number) {
        return db.query(`
            WITH deleted_relations AS (DELETE FROM rel_subjects r_s WHERE r_s.subject_id = $1)
            DELETE FROM subjects s WHERE s.id = $1;
        `, [subjectId]).then(result => {
            return result;
        });
    }
}

export default Subjects;
