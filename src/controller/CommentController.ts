import { Request, Response } from "express";
import { ZodError } from "zod";
import { BaseError } from "../errors/BaseError";
import { CreateCommentSchema } from "../dtos/comments/createComment.dto";
import { EditCommentSchema } from "../dtos/comments/editComment.dto";
import { DeleteCommentSchema } from "../dtos/comments/deleteComment.dto";
import { LikeOrDislikeCommentSchema } from "../dtos/comments/likeOrDislikeComment.dto";
import { CommentBusiness } from "../business/CommentBusiness";
import { GetCommentsSchema } from "../dtos/comments/getComments.dto";


export class CommentController {
    constructor(
        private commentBusiness: CommentBusiness
    ) { }

    public createComment = async (req: Request, res: Response) => {

        try {

            const input = CreateCommentSchema.parse({
                content: req.body.content,
                token: req.headers.authorization,
                postId: req.params.id
            })

            const output = await this.commentBusiness.createComment(input)

            res.status(201).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof ZodError) {
                res.status(400).send(error.issues)
            } else if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public getCommentsByPostId = async (req: Request, res: Response) => {
        try {
            const input = GetCommentsSchema.parse({
                token: req.headers.authorization,
                postId: req.params.id
            })

            const output = await this.commentBusiness.getCommentsByPostId(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public editComment = async (req: Request, res: Response) => {
        try {
            const input = EditCommentSchema.parse({
                token: req.headers.authorization,
                content: req.body.content,
                idToEdit: req.params.id
            })

            const output = await this.commentBusiness.editComment(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof ZodError) {
                res.status(400).send(error.issues)
            } else if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public deleteComment = async (req: Request, res: Response) => {
        try {
            const input = DeleteCommentSchema.parse({
                token: req.headers.authorization,
                idToDelete: req.params.id
            })

            const output = await this.commentBusiness.deleteComment(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof ZodError) {
                res.status(400).send(error.issues)
            } else if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public likeOrDislikeComment = async (req: Request, res: Response) => {
        try {
            const input = LikeOrDislikeCommentSchema.parse({
                token: req.headers.authorization,
                commentId: req.params.id,
                like: req.body.like
            })

            const output = await this.commentBusiness.likeOrDislikeComment(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof ZodError) {
                res.status(400).send(error.issues)
            } else if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }
}