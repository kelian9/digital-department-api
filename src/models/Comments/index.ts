import ICommentReqBody from "../../controllers/commentsController/ICommentReqBody";
import db from "../../db";
import convertToComment from "./convertToComment";

class Comments {
    constructor() {}

    public static getByPublicationId(id: number, page: number, pageSize: number) {
        return db.query(`
            SELECT COUNT(*) OVER() as total_count,
                c.id as id, json_build_object('id', u.id, 'name', u.name, 'post', u.post) as author,
                text_comment,
                array_to_json(array_agg((a.extension, a.name, a.path)::asset)::asset[]) AS assets,
                c.creation_date AS creation_date FROM comments c
            LEFT JOIN users u ON u.id = c.author_id
            LEFT JOIN rel_comments_assets r_c_a ON r_c_a.comment_id = c.id
            LEFT JOIN assets a ON a.id = r_c_a.asset_id
            WHERE c.publication_id = $1
            GROUP BY c.id, u.id
            ORDER BY creation_date DESC
            LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize};
        `, [id]).then((result) => {
            const totalCount = result.rows.length ? result.rows[0].total_count : 0;
            return {
                totalCount: Number(totalCount),
                data: result.rows.map((row) => convertToComment(row))
            };
        });
    }

    public static async create(userId: number, comment: ICommentReqBody) {
        console.log(`
        WITH comment_id AS (
            INSERT INTO comments (publication_id, author_id, text_comment) VALUES ($1, $2, $3) RETURNING id
        )${comment.assets ? ',' : ''}
        ${comment.assets?.map((asset, index) => (
            `asset_id${index} AS (
                INSERT INTO assets (extension, name, path) VALUES ('${asset.extension}', '${asset.name}', '${asset.path}')
                RETURNING id
            )`
        )).join(', ') || ''}${comment.assets ? ',' : ''}
        ${comment.assets?.map((asset, index) => (
            `created_rel${index} AS (
                INSERT INTO rel_comments_assets VALUES ((SELECT id FROM comment_id), (SELECT id FROM asset_id${index}))
            )`
        )).join(`, `) || ''}
        ${comment.assets
            ? 'SELECT asset_id FROM rel_comments_assets r_c_a WHERE r_c_a.comment_id = (SELECT id FROM comment_id);'
            : 'SELECT id FROM comment_id;'
        }
    `);
        return db.query(`
            WITH comment_id AS (
                INSERT INTO comments (publication_id, author_id, text_comment) VALUES ($1, $2, $3) RETURNING id
            )${comment.assets ? ',' : ''}
            ${comment.assets?.map((asset, index) => (
                `asset_id${index} AS (
                    INSERT INTO assets (extension, name, path) VALUES ('${asset.extension}', '${asset.name}', '${asset.path}')
                    RETURNING id
                )`
            )).join(', ') || ''}${comment.assets ? ',' : ''}
            ${comment.assets?.map((asset, index) => (
                `created_rel${index} AS (
                    INSERT INTO rel_comments_assets VALUES ((SELECT id FROM comment_id), (SELECT id FROM asset_id${index}))
                )`
            )).join(`, `) || ''}
            ${comment.assets
                ? 'SELECT asset_id FROM rel_comments_assets r_c_a WHERE r_c_a.comment_id = (SELECT id FROM comment_id);'
                : 'SELECT id FROM comment_id;'
            }
        `, [comment.publicationId, userId, comment.text]).then(result => {
            return result;
        })
    }

    public static delete(id: number) {
        return db.query(`
            WITH deleted_assets_relations AS (
                DELETE FROM rel_comments_assets r_c_a WHERE r_c_a.comment_id = $1 RETURNING r_c_a.asset_id
            ), deleted_assets AS (
                DELETE FROM assets a WHERE a.id IN (SELECT asset_id FROM deleted_assets_relations) RETURNING a.id
            )
            DELETE FROM comments WHERE id = $1
        `, [id]).then(result => result);
    }
}

export default Comments;
