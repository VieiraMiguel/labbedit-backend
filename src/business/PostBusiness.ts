import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/posts/createPost.dto";
import { DeletePostInputDTO, DeletePostOutputDTO } from "../dtos/posts/deletePost.dto";
import { EditPostInputDTO, EditPostOutputDTO } from "../dtos/posts/editPost.dto";
import { GetPostsOutputDTO, GetPostsInputDTO } from "../dtos/posts/getPosts.dto";
import { LikeOrDislikePostInputDTO, LikeOrDislikePostOutputDTO } from "../dtos/posts/likeOrDislikePost.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { POST_LIKE } from "../models/Post";
import { LikeDislikeDB } from "../models/Post";
import { Post } from "../models/Post";
import { USER_ROLES } from "../models/User";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";


export class PostBusiness {

    constructor(
        private postsDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public createPost = async (input: CreatePostInputDTO): Promise<CreatePostOutputDTO> => {

        const { content, token } = input

        const payload = this.tokenManager.getPayload(token);

        if (token === undefined) {
            throw new BadRequestError("'token' ausente");
        }

        if (!payload) {
            throw new UnauthorizedError();
        }

        const id = this.idGenerator.generate();

        const post = new Post(
            id,
            content,
            0,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString(),
            payload.id,
            payload.name
        )

        const postDB = post.toDBModel()

        await this.postsDatabase.createPost(postDB)

        const output: CreatePostOutputDTO = undefined

        return output
    }
    
    public getPosts = async (input: GetPostsInputDTO): Promise<GetPostsOutputDTO> => {

        const { token } = input

        const payload = this.tokenManager.getPayload(token)

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        if (payload === null) {
            throw new UnauthorizedError()
        }

        const postsDBwithCreatorName =
            await this.postsDatabase.getPostsWithCreatorName()

        const posts = postsDBwithCreatorName
            .map((postWithCreatorName) => {
                const post = new Post(
                    postWithCreatorName.id,
                    postWithCreatorName.content,
                    postWithCreatorName.likes,
                    postWithCreatorName.dislikes,
                    postWithCreatorName.comments,
                    postWithCreatorName.created_at,
                    postWithCreatorName.updated_at,
                    postWithCreatorName.creator_id,
                    postWithCreatorName.creator_name
                )

                return post.toBusinessModel()
            })

        const output: GetPostsOutputDTO = posts

        return output
    }

    public editPost = async (input: EditPostInputDTO): Promise<EditPostOutputDTO> => {

        const { content, token, idToEdit } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {

            throw new UnauthorizedError()
        }

        const postDB = await this.postsDatabase.getPostById(idToEdit)

        if (!postDB) {

            throw new NotFoundError('')
        }

        if (payload.id !== postDB.creator_id) {

            throw new ForbiddenError('')
        }

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.comments,
            postDB.created_at,
            new Date().toISOString(),
            postDB.creator_id,
            payload.name
        )

        post.setContent(content)

        const editedPostDB = post.toDBModel()
        await this.postsDatabase.editPost(editedPostDB)

        const output: EditPostOutputDTO = undefined

        return output
    }

    public deletePost = async (
        input: DeletePostInputDTO
    ): Promise<DeletePostOutputDTO> => {
        const { token, idToDelete } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postsDatabase
            .getPostById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("post com essa id não existe")
        }

        if (payload.role !== USER_ROLES.ADMIN) {
            if (payload.id !== postDB.creator_id) {
                throw new ForbiddenError("somente quem criou a post pode editá-lo")
            }
        }

        await this.postsDatabase.deletePost(idToDelete)

        const output: DeletePostOutputDTO = undefined

        return output
    }

    public async likeOrDislikePost (input: LikeOrDislikePostInputDTO): Promise<LikeOrDislikePostOutputDTO> {

        const { token, like, postId } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDBWithCreatorName =
            await this.postsDatabase.findPostWithCreatorNameById(postId)

        if (!postDBWithCreatorName) {
            throw new NotFoundError("post com essa id não existe")
        }

        const post = new Post(
            postDBWithCreatorName.id,
            postDBWithCreatorName.content,
            postDBWithCreatorName.likes,
            postDBWithCreatorName.dislikes,
            postDBWithCreatorName.comments,
            postDBWithCreatorName.created_at,
            postDBWithCreatorName.updated_at,
            postDBWithCreatorName.creator_id,
            postDBWithCreatorName.creator_name
        )

        const likeSQlite = like ? 1 : 0

        const likeDislikeDB: LikeDislikeDB = {
            user_id: payload.id,
            post_id: postId,
            like: likeSQlite
        }

        const likeDislikeExists =
            await this.postsDatabase.findLikeDislike(likeDislikeDB)

        if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.postsDatabase.removeLikeDislike(likeDislikeDB)
                post.removeLike()
            } else {
                await this.postsDatabase.updateLikeDislike(likeDislikeDB)
                post.removeLike()
                post.addDislike()
            }

        } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
            if (like === false) {
                await this.postsDatabase.removeLikeDislike(likeDislikeDB)
                post.removeDislike()
            } else {
                await this.postsDatabase.updateLikeDislike(likeDislikeDB)
                post.removeDislike()
                post.addLike()
            }

        } else {
            await this.postsDatabase.insertLikeDislike(likeDislikeDB)
            like ? post.addLike() : post.addDislike()
        }

        const editedPostDB = post.toDBModel()
        await this.postsDatabase.editPost(editedPostDB)

        const output: LikeOrDislikePostOutputDTO = undefined

        return output
    }
}