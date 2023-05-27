import { COMMENT_LIKE, CommentDB, CommentDBWithCreatorName, LikeDislikeDB } from "../models/Comment";
import { BaseDatabase } from "./BaseDatabase";
import { UserDatabase } from "./UserDatabase";

export class CommentDatabase extends BaseDatabase {

    public static TABLE_COMMENTS = 'comments'

    public static TABLE_LIKES_DISLIKES_COMMENT = "likes_dislikes_comment"
    

    public async createComment(commentDB: CommentDB): Promise<void> {

        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .insert(commentDB)
    }

    public async getCommentWithCreatorName(): Promise<CommentDBWithCreatorName[]> {

        const result = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .select(
                `${CommentDatabase.TABLE_COMMENTS}.id`,
                `${CommentDatabase.TABLE_COMMENTS}.post_id`,
                `${CommentDatabase.TABLE_COMMENTS}.creator_id`,
                `${CommentDatabase.TABLE_COMMENTS}.content`,
                `${CommentDatabase.TABLE_COMMENTS}.likes`,
                `${CommentDatabase.TABLE_COMMENTS}.dislikes`,
                `${CommentDatabase.TABLE_COMMENTS}.created_at`,
                `${CommentDatabase.TABLE_COMMENTS}.updated_at`,
                `${UserDatabase.TABLE_USERS}.name as creator_name`,
            )
            .join(
                `${UserDatabase.TABLE_USERS}`,
                `${CommentDatabase.TABLE_COMMENTS}.creator_id`,
                '=',
                `${UserDatabase.TABLE_USERS}.id`,
            )

        return result as CommentDBWithCreatorName[]
    }

    public async getCommentById(id: string): Promise<CommentDB | undefined> {

        const [result] = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .where({ id })

        return result as CommentDB | undefined
    }

    public async editComment(commentDB: CommentDB): Promise<void> {

        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .update(commentDB)
            .where({ id: commentDB.id })
    }

    public async deleteComment(id: string): Promise<void> {

        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .delete()
            .where({ id })
    }

    public async getCommentsByPostId(postId: string): Promise<CommentDBWithCreatorName[]> {

        const result = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .select(
                `${CommentDatabase.TABLE_COMMENTS}.id`,
                `${CommentDatabase.TABLE_COMMENTS}.post_id`,
                `${CommentDatabase.TABLE_COMMENTS}.creator_id`,
                `${CommentDatabase.TABLE_COMMENTS}.content`,
                `${CommentDatabase.TABLE_COMMENTS}.likes`,
                `${CommentDatabase.TABLE_COMMENTS}.dislikes`,
                `${CommentDatabase.TABLE_COMMENTS}.created_at`,
                `${CommentDatabase.TABLE_COMMENTS}.updated_at`,
                `${UserDatabase.TABLE_USERS}.name as creator_name`
            )
            .join(
                `${UserDatabase.TABLE_USERS}`,
                `${CommentDatabase.TABLE_COMMENTS}.creator_id`,
                "=",
                `${UserDatabase.TABLE_USERS}.id`
            )
            .where({ post_id: postId })

        return result as CommentDBWithCreatorName[]
    }

    public async findCommentWithCreatorNameById(id: string): Promise<CommentDBWithCreatorName | undefined> {

        const [result] = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .select(
                `${CommentDatabase.TABLE_COMMENTS}.id`,
                `${CommentDatabase.TABLE_COMMENTS}.creator_id`,
                `${CommentDatabase.TABLE_COMMENTS}.content`,
                `${CommentDatabase.TABLE_COMMENTS}.likes`,
                `${CommentDatabase.TABLE_COMMENTS}.dislikes`,
                `${CommentDatabase.TABLE_COMMENTS}.created_at`,
                `${CommentDatabase.TABLE_COMMENTS}.updated_at`,
                `${UserDatabase.TABLE_USERS}.name as creator_name`
            )
            .join(
                `${UserDatabase.TABLE_USERS}`,
                `${CommentDatabase.TABLE_COMMENTS}.creator_id`,
                "=",
                `${UserDatabase.TABLE_USERS}.id`
            )
            .where({ [`${CommentDatabase.TABLE_COMMENTS}.id`]: id })

        return result as CommentDBWithCreatorName | undefined
    }

    public async findLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<COMMENT_LIKE | undefined> {

        const [result]: Array<LikeDislikeDB | undefined> = await BaseDatabase
            .connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENT)
            .select()
            .where({
                user_id: likeDislikeDB.user_id,
                comment_id: likeDislikeDB.comment_id
            })

        if (result === undefined) {
            return undefined

        } else if (result.like === 1) {
            return COMMENT_LIKE.ALREADY_LIKED

        } else {
            return COMMENT_LIKE.ALREADY_DISLIKED
        }
    }

    public async removeLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<void> {

        await BaseDatabase
            .connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENT)
            .delete()
            .where({
                user_id: likeDislikeDB.user_id,
                comment_id: likeDislikeDB.comment_id
            })
    }

    public async updateLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<void> {

        await BaseDatabase
            .connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENT)
            .update(likeDislikeDB)
            .where({
                user_id: likeDislikeDB.user_id,
                comment_id: likeDislikeDB.comment_id
            })
    }

    public async insertLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<void> {

        await BaseDatabase
            .connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENT)
            .insert(likeDislikeDB)
    }
}