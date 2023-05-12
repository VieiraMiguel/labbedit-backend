import z from "zod";

export interface CreateCommentInputDTO {
    content: string,
    token: string
}

export type CreateCommentOutputDTO = undefined

export const CreateCommentSchema = z.object({
    content: z.string().min(1),
    token: z.string().min(1)
}).transform(data => data as CreateCommentInputDTO)