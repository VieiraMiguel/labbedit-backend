import { CommentDatabase } from "../database/CommentDatabase";
import { CreateCommentInputDTO, CreateCommentOutputDTO } from "../dtos/comments/createComment.dto";
import { DeleteCommentInputDTO, DeleteCommentOutputDTO } from "../dtos/comments/deleteComment.dto";
import { EditCommentInputDTO, EditCommentOutputDTO } from "../dtos/comments/editComment.dto";
import { GetCommentsInputDTO, GetCommentsOutputDTO } from "../dtos/comments/getComments.dto";
import { LikeOrDislikeCommentInputDTO, LikeOrDislikeCommentOutputDTO } from "../dtos/comments/likeOrDislikeComment.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { Comment } from "../models/Comment";
import { POST_LIKE } from "../models/Post";
import { LikeDislikeDB } from "../models/Comment";
import { Post } from "../models/Post";
import { USER_ROLES } from "../models/User";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { COMMENT_LIKE } from "../models/Comment";
import { PostDatabase } from "../database/PostDatabase";


export class CommentBusiness {

    constructor(
        private commentsDatabase: CommentDatabase,
        //private postsDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public createComment = async (input: CreateCommentInputDTO): Promise<CreateCommentOutputDTO> => {

        const { postId, content, token } = input

        const payload = this.tokenManager.getPayload(token);

        if (token === undefined) {
            throw new BadRequestError("'token' ausente");
        }

        if (!payload) {
            throw new UnauthorizedError();
        }

        const id = this.idGenerator.generate();

        const comment = new Comment(
            id,
            postId,
            content,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString(),
            payload.id,
            payload.name
        )

        const commentDB = comment.toDBModel()

        await this.commentsDatabase.createComment(commentDB)

        const output: CreateCommentOutputDTO = undefined

        return output
    }

    public getCommentsByPostId = async (input: GetCommentsInputDTO): Promise<GetCommentsOutputDTO> => {

        const { token, postId } = input

        const payload = this.tokenManager.getPayload(token)

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        if (payload === null) {
            throw new UnauthorizedError()
        }

        const commentsDBwithCreatorName =
            await this.commentsDatabase.getCommentsByPostId(postId)

        const comments = commentsDBwithCreatorName
            .map((commentWithCreatorName) => {
                const comment = new Comment(
                    commentWithCreatorName.id,
                    commentWithCreatorName.post_id,
                    commentWithCreatorName.content,
                    commentWithCreatorName.likes,
                    commentWithCreatorName.dislikes,
                    commentWithCreatorName.created_at,
                    commentWithCreatorName.updated_at,
                    commentWithCreatorName.creator_id,
                    commentWithCreatorName.creator_name
                )

                return comment.toBusinessModel()
            })

        const output: GetCommentsOutputDTO = comments

        return output
    }

    public editComment = async (input: EditCommentInputDTO): Promise<EditCommentOutputDTO> => {

        const { content, token, idToEdit } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {

            throw new UnauthorizedError()
        }

        const commentDB = await this.commentsDatabase.getCommentById(idToEdit)

        if (!commentDB) {

            throw new NotFoundError('')
        }

        if (payload.id !== commentDB.creator_id) {

            throw new ForbiddenError('')
        }

        const comment = new Comment(
            commentDB.id,
            commentDB.post_id,
            commentDB.content,
            commentDB.likes,
            commentDB.dislikes,
            commentDB.created_at,
            new Date().toISOString(),
            commentDB.creator_id,
            payload.name
        )

        comment.setContent(content)

        const editedCommentDB = comment.toDBModel()
        await this.commentsDatabase.editComment(editedCommentDB)

        const output: EditCommentOutputDTO = undefined

        return output
    }

    public deleteComment = async (
        input: DeleteCommentInputDTO
    ): Promise<DeleteCommentOutputDTO> => {
        const { token, idToDelete } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const commentDB = await this.commentsDatabase
            .getCommentById(idToDelete)

        if (!commentDB) {
            throw new NotFoundError("comment com essa id não existe")
        }

        if (payload.role !== USER_ROLES.ADMIN) {
            if (payload.id !== commentDB.creator_id) {
                throw new ForbiddenError("somente quem criou a comment pode editá-lo")
            }
        }

        await this.commentsDatabase.deleteComment(idToDelete)

        const output: DeleteCommentOutputDTO = undefined

        return output
    }

    public async likeOrDislikeComment(input: LikeOrDislikeCommentInputDTO): Promise<LikeOrDislikeCommentOutputDTO> {

        const { token, like, commentId } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const commentDBWithCreatorName =
            await this.commentsDatabase.findCommentWithCreatorNameById(commentId)

        if (!commentDBWithCreatorName) {
            throw new NotFoundError("comment com essa id não existe")
        }

        const comment = new Comment(
            commentDBWithCreatorName.id,
            commentDBWithCreatorName.post_id,
            commentDBWithCreatorName.content,
            commentDBWithCreatorName.likes,
            commentDBWithCreatorName.dislikes,
            commentDBWithCreatorName.created_at,
            commentDBWithCreatorName.updated_at,
            commentDBWithCreatorName.creator_id,
            commentDBWithCreatorName.creator_name
        )

        const likeSQlite = like ? 1 : 0

        const likeDislikeDB: LikeDislikeDB = {
            user_id: payload.id,
            comment_id: commentId,
            like: likeSQlite
        }

        const likeDislikeExists =
            await this.commentsDatabase.findLikeDislike(likeDislikeDB)

        if (likeDislikeExists === COMMENT_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.commentsDatabase.removeLikeDislike(likeDislikeDB)
                comment.removeLike()
            } else {
                await this.commentsDatabase.updateLikeDislike(likeDislikeDB)
                comment.removeLike()
                comment.addDislike()
            }

        } else if (likeDislikeExists === COMMENT_LIKE.ALREADY_DISLIKED) {
            if (like === false) {
                await this.commentsDatabase.removeLikeDislike(likeDislikeDB)
                comment.removeDislike()
            } else {
                await this.commentsDatabase.updateLikeDislike(likeDislikeDB)
                comment.removeDislike()
                comment.addLike()
            }

        } else {
            await this.commentsDatabase.insertLikeDislike(likeDislikeDB)
            like ? comment.addLike() : comment.addDislike()
        }

        const editedCommentDB = comment.toDBModel()
        await this.commentsDatabase.editComment(editedCommentDB)

        const output: LikeOrDislikeCommentOutputDTO = undefined

        return output
    }
}