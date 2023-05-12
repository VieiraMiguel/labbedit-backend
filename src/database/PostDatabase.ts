import { LikeDislikeDB, POST_LIKE, PostDB, PostDBWithCreatorName } from "../models/Post";
import { BaseDatabase } from "./BaseDatabase";
import { UserDatabase } from "./UserDatabase";

export class PostDatabase extends BaseDatabase {

    public static TABLE_POSTS = 'posts'

    public static TABLE_LIKES_DISLIKES_POST = "likes_dislikes_post"

    public async createPost(postDB: PostDB): Promise<void> {

        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .insert(postDB)
    }

    public async getPostsWithCreatorName(): Promise<PostDBWithCreatorName[]> {

        const result = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                `${PostDatabase.TABLE_POSTS}.id`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                `${PostDatabase.TABLE_POSTS}.content`,
                `${PostDatabase.TABLE_POSTS}.likes`,
                `${PostDatabase.TABLE_POSTS}.dislikes`,
                `${PostDatabase.TABLE_POSTS}.comments`,
                `${PostDatabase.TABLE_POSTS}.created_at`,
                `${PostDatabase.TABLE_POSTS}.updated_at`,
                `${UserDatabase.TABLE_USERS}.name as creator_name`,
            )
            .join(
                `${UserDatabase.TABLE_USERS}`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                '=',
                `${UserDatabase.TABLE_USERS}.id`,
            )

        return result as PostDBWithCreatorName[]
    }

    public async getPostById(id: string): Promise<PostDB | undefined> {

        const [result] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .where({ id })

        return result as PostDB | undefined
    }

    public async editPost(postDB: PostDB): Promise<void> {

        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .update(postDB)
            .where({ id: postDB.id })
    }

    public async deletePost(id: string): Promise<void> {

        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .delete()
            .where({ id })
    }

    public async findPostWithCreatorNameById(id: string): Promise<PostDBWithCreatorName | undefined> {

        const [result] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                `${PostDatabase.TABLE_POSTS}.id`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                `${PostDatabase.TABLE_POSTS}.content`,
                `${PostDatabase.TABLE_POSTS}.likes`,
                `${PostDatabase.TABLE_POSTS}.dislikes`,
                `${PostDatabase.TABLE_POSTS}.created_at`,
                `${PostDatabase.TABLE_POSTS}.updated_at`,
                `${UserDatabase.TABLE_USERS}.name as creator_name`
            )
            .join(
                `${UserDatabase.TABLE_USERS}`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                "=",
                `${UserDatabase.TABLE_USERS}.id`
            )
            .where({ [`${PostDatabase.TABLE_POSTS}.id`]: id })

        return result as PostDBWithCreatorName | undefined
    }

    public async findLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<POST_LIKE | undefined> {

        const [result]: Array<LikeDislikeDB | undefined> = await BaseDatabase
            .connection(PostDatabase.TABLE_LIKES_DISLIKES_POST)
            .select()
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id
            })

        if (result === undefined) {
            return undefined

        } else if (result.like === 1) {
            return POST_LIKE.ALREADY_LIKED

        } else {
            return POST_LIKE.ALREADY_DISLIKED
        }
    }

    public async removeLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<void> {

        await BaseDatabase
            .connection(PostDatabase.TABLE_LIKES_DISLIKES_POST)
            .delete()
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id
            })
    }

    public async updateLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<void> {

        await BaseDatabase
            .connection(PostDatabase.TABLE_LIKES_DISLIKES_POST)
            .update(likeDislikeDB)
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id
            })
    }

    public async insertLikeDislike(likeDislikeDB: LikeDislikeDB): Promise<void> {

        await BaseDatabase
            .connection(PostDatabase.TABLE_LIKES_DISLIKES_POST)
            .insert(likeDislikeDB)
    }
}