import IFeedbackReqBody from "../../controllers/feedbacksController/IFeedbackReqBody";
import db from "../../db";
import convertToComment from "../Comments/convertToComment";

class Feedbacks {
    constructor() {}

    public static getFeedbacks(page: number, pageSize: number) {
        return db.query(`
            SELECT COUNT(*) OVER() as total_count,
                id, theme, user_name, email, message, creation_date
            FROM feedbacks f
            ORDER BY creation_date DESC
            LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize};
        `).then((result) => {
            const totalCount = result.rows.length ? result.rows[0].total_count : 0;
            return {
                totalCount: Number(totalCount),
                data: result.rows.map((row) => convertToComment(row))
            };
        });
    }

    public static create(feedback: IFeedbackReqBody) {
        const { theme, userName, email, message } = feedback;
        return db.query(`
            INSERT INTO feedbacks (theme, user_name, email, message) VALUES ($1, $2, $3, $4)
        `, [theme, userName, email, message]).then(result => {
            return result;
        })
    }

    public static delete(id: number) {
        return db.query(`DELETE FROM feedbacks WHERE id = $1`, [id]).then(result => result);
    }
}

export default Feedbacks;
