import moment from "moment";
import IPublicationReqBody from "../../controllers/publicationsController/IPublicationReqBody";
import db from "../../db";
import IPagination from "../IPagination";
import convertToPublication from "./convertToPublication";
import IPublicationsFilter from "./IPublicationsFilter";
import publicationAttributes from "./publicationAttributes";

const getAttributesByPrefix = (prefix: string) =>
    publicationAttributes.split(', ').map(item => prefix + item).join(', ');

class Publications {
    constructor() {}

    public static getById(id: number, userId?: number) {
        return db.query(`
            WITH publications_authors AS (
                SELECT ${getAttributesByPrefix('p.')}, array_agg((a.id, a.name)::author) as authors_list
                FROM publications p
                LEFT JOIN rel_authors r_a ON r_a.publication_id = p.id
                LEFT JOIN authors a ON a.id = r_a.author_id
                GROUP BY p.id
            ), publications_tags AS (
                SELECT ${getAttributesByPrefix('p_a.')}, p_a.authors_list,
                    array_agg((t.id, t.name)::tag) as tags_list FROM publications_authors p_a
                LEFT JOIN rel_tags r_t ON r_t.publication_id = p_a.id
                LEFT JOIN tags t ON t.id = r_t.tag_id
                GROUP BY ${getAttributesByPrefix('p_a.')}, p_a.authors_list
            )
            ${userId
                ? `, publications_f AS (
                        SELECT ${getAttributesByPrefix('p_t.')}, p_t.authors_list, p_t.tags_list, 
                            f.publication_id::boolean AS is_favourite
                        FROM publications_tags p_t
                        LEFT JOIN favourites f ON p_t.id = f.publication_id AND f.user_id = ${userId}
                    )`
                : ''
            }
            , publications_subjects AS (
                SELECT ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list, 
                    array_agg((s.id, s.name)::subject) as subjects_list
                    ${userId ? ',p_f.is_favourite' : ''}
                FROM ${userId ? 'publications_f' : 'publications_tags'} p_f
                LEFT JOIN rel_subjects r_s ON r_s.publication_id = p_f.id
                LEFT JOIN subjects s ON s.id = r_s.subject_id
                GROUP BY ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list
                ${userId ? ', p_f.is_favourite' : ''}
            )
            SELECT COUNT(*) OVER() as total_count,
                ${getAttributesByPrefix('p_s.')},
                array_to_json(p_s.authors_list::author[]) AS authors,
                array_to_json(p_s.tags_list::tag[]) AS tags,
                array_to_json(p_s.subjects_list::subject[]) AS subjects ${userId ? ', p_s.is_favourite' : ''}
            FROM publications_subjects p_s WHERE p_s.id = $1
        `, [id]).then(result => {
            return result.rows.map((row) => convertToPublication(row))[0];
        });
    }

    public static findByUserId(userId: number) {
        return db.query('SELECT * FROM publications p WHERE p.user_id = $1', [userId])
            .then((res) => {
                return res.rows;
            })
    }

    public static getPublications(filter: IPublicationsFilter, userId?: number) {
        let params: any = {};
        let firstIndex = 1;
        let typesIndex = 0;
        let authorsIndex = 0;
        let tagsIndex = 0;
        let subjectsIndex = 0;
        filter.sortBy = Number(filter.sortBy);
        filter.sortOrder = Number(filter.sortOrder);
        if (filter) {
            Object.entries(filter).filter(([key]) =>
                key.slice(0,4) !== 'page' && key.slice(0,4) !== 'sort'
            ).map(([key, value]) => {
                params[`$${firstIndex++}`] = value.join(', ');
                if (key === 'type' && value && value.length) {
                    typesIndex = firstIndex - 1;
                    return;
                }
                if (key === 'authors' && value && value.length) {
                    authorsIndex = firstIndex - 1;
                    return;
                }
                if (key === 'tags' && value && value.length) {
                    tagsIndex = firstIndex - 1;
                    return;
                }
                if (key === 'subjects' && value && value.length) {
                    subjectsIndex = firstIndex - 1;
                }
                return;
            })
        }

        return (Object.keys(params).length
            ? db.query(`
                WITH publications_authors AS (
                    SELECT ${getAttributesByPrefix('p.')}, array_agg((a.id, a.name)::author) as authors_list
                    FROM publications p
                    ${authorsIndex ? 'RIGHT OUTER' : 'LEFT'} JOIN rel_authors r_a ON r_a.publication_id = p.id
                    ${authorsIndex ? `AND r_a.author_id IN (${params['$' + authorsIndex]})` : ''}
                    LEFT JOIN authors a ON a.id = r_a.author_id
                    ${typesIndex ? `WHERE p.type IN (${params['$' + typesIndex]})` : ''}
                    GROUP BY p.id
                ), publications_tags AS (
                    SELECT ${getAttributesByPrefix('p_a.')}, p_a.authors_list,
                        array_agg((t.id, t.name)::tag) as tags_list FROM publications_authors p_a
                    ${tagsIndex ? 'RIGHT OUTER' : 'LEFT'} JOIN rel_tags r_t ON r_t.publication_id = p_a.id
                    ${tagsIndex ? `AND r_t.tag_id IN (${params['$' + tagsIndex]})` : ''}
                    LEFT JOIN tags t ON t.id = r_t.tag_id
                    GROUP BY ${getAttributesByPrefix('p_a.')}, p_a.authors_list
                ),
                ${userId
                    ? `publications_f AS (
                            SELECT ${getAttributesByPrefix('p_t.')}, p_t.authors_list, p_t.tags_list, 
                                f.publication_id::boolean AS is_favourite
                            FROM publications_tags p_t
                            LEFT JOIN favourites f ON p_t.id = f.publication_id AND f.user_id = ${userId}
                        ),`
                    : ''
                }
                publications_subjects AS (
                    SELECT ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list, 
                        array_agg((s.id, s.name)::subject) as subjects_list
                        ${userId ? ',p_f.is_favourite' : ''}
                    FROM ${userId ? 'publications_f' : 'publications_t'} p_f
                    ${subjectsIndex ? 'RIGHT OUTER' : 'LEFT'} JOIN rel_subjects r_s ON r_s.publication_id = p_f.id
                    ${subjectsIndex ? `AND r_s.subject_id IN (${params['$' + subjectsIndex]})` : ''}
                    LEFT JOIN subjects s ON s.id = r_s.subject_id
                    GROUP BY ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list
                    ${userId ? ', p_f.is_favourite' : ''}
                )
                SELECT COUNT(*) OVER() as total_count,
                    ${getAttributesByPrefix('p_s.')},
                    array_to_json(p_s.authors_list::author[]) AS authors,
                    array_to_json(p_s.tags_list::tag[]) AS tags,
                    array_to_json(p_s.subjects_list::subject[]) AS subjects ${userId ? ', p_s.is_favourite' : ''}
                FROM publications_subjects p_s WHERE p_s.id IS NOT NULL AND p_s.status = 1
                ${filter.sortBy !== undefined
                    ? `ORDER BY ${filter.sortBy ? 'title' : 'creation_date'} ${filter.sortOrder ? 'ASC' : 'DESC'}`
                    : ''
                }
                LIMIT ${filter?.pageSize} OFFSET ${(filter?.page - 1) * filter?.pageSize};
            `)
            : db.query(`
                WITH publications_authors AS (
                    SELECT ${getAttributesByPrefix('p.')}, array_agg((a.id, a.name)::author) as authors_list
                    FROM publications p
                    LEFT JOIN rel_authors r_a ON r_a.publication_id = p.id
                    LEFT JOIN authors a ON a.id = r_a.author_id
                    GROUP BY p.id
                ), publications_tags AS (
                    SELECT ${getAttributesByPrefix('p_a.')}, p_a.authors_list,
                        array_agg((t.id, t.name)::tag) as tags_list FROM publications_authors p_a
                    LEFT JOIN rel_tags r_t ON r_t.publication_id = p_a.id
                    LEFT JOIN tags t ON t.id = r_t.tag_id
                    GROUP BY ${getAttributesByPrefix('p_a.')}, p_a.authors_list
                )
                ${userId
                    ? `, publications_f AS (
                            SELECT ${getAttributesByPrefix('p_t.')}, p_t.authors_list, p_t.tags_list, 
                                f.publication_id::boolean AS is_favourite
                            FROM publications_tags p_t
                            LEFT JOIN favourites f ON p_t.id = f.publication_id AND f.user_id = ${userId}
                        )`
                    : ''
                }
                , publications_subjects AS (
                    SELECT ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list, 
                        array_agg((s.id, s.name)::subject) as subjects_list
                        ${userId ? ', p_f.is_favourite' : ''}
                    FROM ${userId ? 'publications_f' : 'publications_tags'} p_f
                    LEFT JOIN rel_subjects r_s ON r_s.publication_id = p_f.id
                    LEFT JOIN subjects s ON s.id = r_s.subject_id
                    GROUP BY ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list
                    ${userId ? ', p_f.is_favourite' : ''}
                )
                SELECT COUNT(*) OVER() as total_count,
                    ${getAttributesByPrefix('p_s.')},
                    array_to_json(p_s.authors_list::author[]) AS authors,
                    array_to_json(p_s.tags_list::tag[]) AS tags,
                    array_to_json(p_s.subjects_list::subject[]) AS subjects
                    ${userId ? ', p_s.is_favourite' : ''}
                FROM publications_subjects p_s WHERE p_s.id IS NOT NULL AND p_s.status = 1
                ${filter.sortBy !== undefined
                    ? `ORDER BY ${filter.sortBy ? 'title' : 'creation_date'} ${filter.sortOrder ? 'ASC' : 'DESC'}`
                    : ''
                }
                LIMIT ${filter?.pageSize} OFFSET ${(filter?.page - 1) * filter?.pageSize};
            `)).then((result) => {
                const totalCount = result.rows.length ? result.rows[0].total_count : 0;
                return {
                    totalCount: Number(totalCount),
                    data: result.rows.map((row) => convertToPublication(row))
                };
            })
    }

    public static async searchPublications(page: number, pageSize: number, substr?: string, userId?: number) {
        return db.query(`
            WITH by_authors AS (
                SELECT * FROM authors a WHERE LOWER(a.name) LIKE $1 
            ), by_tags AS (
                SELECT * FROM subjects s WHERE LOWER(s.name) LIKE $1
            ), by_subjects AS (
                SELECT * FROM tags t WHERE LOWER(t.name) LIKE $1
            ), publications_authors AS (
                SELECT ${getAttributesByPrefix('p.')}, array_agg((a.id, a.name)::author) as authors_list
                FROM publications p
                LEFT JOIN rel_authors r_a ON r_a.publication_id = p.id
                LEFT JOIN authors a ON a.id = r_a.author_id
                GROUP BY p.id
            ), publications_tags AS (
                SELECT ${getAttributesByPrefix('p_a.')}, p_a.authors_list,
                    array_agg((t.id, t.name)::tag) as tags_list FROM publications_authors p_a
                LEFT JOIN rel_tags r_t ON r_t.publication_id = p_a.id
                LEFT JOIN tags t ON t.id = r_t.tag_id
                GROUP BY ${getAttributesByPrefix('p_a.')}, p_a.authors_list
            )
            ${userId
                ? `, publications_f AS (
                        SELECT ${getAttributesByPrefix('p_t.')}, p_t.authors_list, p_t.tags_list, 
                            f.publication_id::boolean AS is_favourite
                        FROM publications_tags p_t
                        LEFT JOIN favourites f ON p_t.id = f.publication_id AND f.user_id = ${userId}
                    )`
                : ''
            }
            , publications_subjects AS (
                SELECT ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list, 
                    array_agg((s.id, s.name)::subject) as subjects_list
                    ${userId ? ', p_f.is_favourite' : ''}
                FROM ${userId ? 'publications_f' : 'publications_tags'} p_f
                LEFT JOIN rel_subjects r_s ON r_s.publication_id = p_f.id
                LEFT JOIN subjects s ON s.id = r_s.subject_id
                GROUP BY ${getAttributesByPrefix('p_f.')}, p_f.authors_list, p_f.tags_list
                ${userId ? ', p_f.is_favourite' : ''}
            )
            SELECT COUNT(*) OVER() as total_count,
                ${getAttributesByPrefix('p_s.')},
                array_to_json(p_s.authors_list::author[]) AS authors,
                array_to_json(p_s.tags_list::tag[]) AS tags,
                array_to_json(p_s.subjects_list::subject[]) AS subjects
                ${userId ? ', p_s.is_favourite' : ''}
            FROM publications_subjects p_s
            WHERE p_s.id IS NOT NULL AND p_s.status = 1 AND
                (
                    p_s.authors_list @> (SELECT array_agg((b_a.id, b_a.name)::author) AS list FROM by_authors b_a)
                        OR p_s.tags_list @> (SELECT array_agg((b_t.id, b_t.name)::tag) AS list FROM by_tags b_t)
                        OR p_s.subjects_list @> (SELECT array_agg((b_s.id, b_s.name)::subject) AS list FROM by_subjects b_s)
                        OR LOWER(p_s.title) LIKE $1
                )
            ORDER BY creation_date DESC
            LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize};
        `, ['%' + substr + '%']).then((result) => {
            const totalCount = result.rows.length ? result.rows[0].total_count : 0;
            return {
                totalCount: Number(totalCount),
                data: result.rows.map((row) => convertToPublication(row))
            };
        });
    }

    public static async getFavouritesByUserId(userId: number, pagination: IPagination) {
        return db.query(`
            WITH publication_favourites AS (
                SELECT ${getAttributesByPrefix('p.')} FROM publications p
                RIGHT OUTER JOIN
                (SELECT * FROM favourites WHERE user_id = ${userId}) f ON f.publication_id = p.id
            ), publications_authors AS (
                SELECT ${getAttributesByPrefix('p_f.')}, array_agg((a.id, a.name)::author) as authors_list
                FROM publication_favourites p_f
                LEFT JOIN rel_authors r_a ON r_a.publication_id = p_f.id
                LEFT JOIN authors a ON a.id = r_a.author_id
                GROUP BY ${getAttributesByPrefix('p_f.')}
            ), publications_tags AS (
                SELECT ${getAttributesByPrefix('p_a.')}, p_a.authors_list,
                    array_agg((t.id, t.name)::tag) as tags_list FROM publications_authors p_a
                LEFT JOIN rel_tags r_t ON r_t.publication_id = p_a.id
                LEFT JOIN tags t ON t.id = r_t.tag_id
                GROUP BY ${getAttributesByPrefix('p_a.')}, p_a.user_id, p_a.authors_list
            ), publications_subjects AS (
                SELECT ${getAttributesByPrefix('p_t.')}, p_t.authors_list, p_t.tags_list, 
                    array_agg((s.id, s.name)::subject) as subjects_list FROM publications_tags p_t
                LEFT JOIN rel_subjects r_s ON r_s.publication_id = p_t.id
                LEFT JOIN subjects s ON s.id = r_s.subject_id
                GROUP BY ${getAttributesByPrefix('p_t.')}, p_t.user_id, p_t.authors_list, p_t.tags_list
            )
            SELECT COUNT(*) OVER() as total_count,
                ${getAttributesByPrefix('p_s.')},
                array_to_json(p_s.authors_list::author[]) AS authors,
                array_to_json(p_s.tags_list::tag[]) AS tags,
                array_to_json(p_s.subjects_list::subject[]) AS subjects,
                p_s.id::boolean AS is_favourite
            FROM publications_subjects p_s WHERE p_s.id IS NOT NULL AND p_s.status = 1
            LIMIT ${pagination?.pageSize} OFFSET ${(pagination?.page - 1) * pagination?.pageSize};
        `).then(result => {
            const totalCount = result.rows.length ? result.rows[0].total_count : 0;
            return {
                totalCount: Number(totalCount),
                data: result.rows.map((row) => convertToPublication(row))
            };
        });
    }

    public static async create(userId: number, publication: IPublicationReqBody) {
        console.log(publication);
        const notExistedAuthors = publication.authors?.filter(author => (author.id as any) === 'null');
        const existedAuthors = publication.authors?.filter(author => (author.id as any) !== 'null');
        const notExistedSubjects = publication.subjects?.filter(subject => (subject.id as any) === 'null');
        const existedSubjects = publication.subjects?.filter(subject => (subject.id as any) !== 'null');
        const notExistedTags = publication.tags?.filter(tag => (tag.id as any) === 'null');
        const existedTags = publication.tags?.filter(tag => (tag.id as any) !== 'null');
        await db.query('BEGIN');
        return db.query(`
            WITH created_publication as (
                INSERT INTO publications (user_id, type, title, review, cover_path, file_path, release_date, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id as publication_id
            )
            SELECT publication_id AS id FROM created_publication;
        `, [
            userId,
            publication.type,
            publication.title,
            publication.review,
            publication.cover,
            publication.file,
            publication.releaseDate || moment(new Date(Date.now())).format('YYYY-MM-DD'),
            0
        ]).then(async (res) => {
            notExistedAuthors?.map(async (a) => await db.query(`
                WITH created_authors as (INSERT INTO authors (name) VALUES ('${a.name}') RETURNING id AS author_id)
                INSERT INTO rel_authors VALUES((SELECT author_id FROM created_authors), $1);
            `, [res.rows[0].id]));
            existedAuthors?.map(async (a) => await db.query(`
                INSERT INTO rel_authors VALUES (${a.id}, $1);
            `, [res.rows[0].id]));
            notExistedSubjects?.map(async (s) => await db.query(`
                WITH created_subjects AS (INSERT INTO subjects (name) VALUES ('${s.name}') RETURNING id as subject_id)
                INSERT INTO rel_subjects VALUES ((SELECT subject_id FROM created_subjects), $1);
            `, [res.rows[0].id]));
            existedSubjects?.map(async (s) => await db.query(`
                INSERT INTO rel_subjects VALUES (${s.id}, $1);
            `, [res.rows[0].id]));
            notExistedTags?.map(async (t) => await db.query(`
                WITH created_tags AS (INSERT INTO tags (name) VALUES ('${t.name}') RETURNING id as tag_id)
                INSERT INTO rel_tags VALUES ((SELECT tag_id FROM created_tags), $1);
            `, [res.rows[0].id]));
            existedTags?.map(async (t) => await db.query(`
                INSERT INTO rel_tags VALUES (${t.id}, $1);
            `, [res.rows[0].id]));
            const result = await this.getById(res.rows[0].id);
            await db.query('COMMIT');
            return result;
        });
    }

    public static async updateStatus(id: number, status: number) {
        return db.query(`
            WITH publication AS (
                UPDATE publications p SET status = $1 WHERE p.id = $2 RETURNING user_id, title
            ), emails AS (
                SELECT email FROM users u WHERE u.id = (SELECT user_id FROM publication)
            )
            SELECT email, publication.title AS title FROM emails, publication;
        `, [status, id]).then(result => {
            return result.rows[0];
        });
    }

    public static async updateFavourite(userId: number, id: number) {
        return db.query(`
            SELECT * FROM favourites f WHERE f.user_id = $1 AND f.publication_id = $2;
        `, [userId, id]).then(favourite => {
            const query = favourite.rowCount
                ? `DELETE FROM favourites f WHERE f.user_id = $1 AND f.publication_id = $2;`
                : `INSERT INTO favourites (user_id, publication_id) VALUES ($1, $2);`;
            return db.query(query, [userId, id]).then(result => {
                return result;
            });
        });
    }
}

export default Publications;
