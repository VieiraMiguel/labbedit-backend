import express from "express"
import { CommentBusiness } from "../business/CommentBusiness"
import { CommentController } from "../controller/CommentController"
import { CommentDatabase } from "../database/CommentDatabase"
import { IdGenerator } from "../services/IdGenerator"
import { TokenManager } from "../services/TokenManager"
import { PostDatabase } from "../database/PostDatabase"

export const commentRouter = express.Router()

const commentController = new CommentController(
    new CommentBusiness(
        new CommentDatabase(),
        new IdGenerator(),
        new TokenManager()
    )
)

commentRouter.post('/post/:id', commentController.createComment)
commentRouter.get('/post/:id', commentController.getCommentsByPostId)
commentRouter.put("/:id", commentController.editComment)
commentRouter.delete("/:id", commentController.deleteComment)

commentRouter.put("/:id/like", commentController.likeOrDislikeComment)