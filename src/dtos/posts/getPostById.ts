import z from 'zod'
import { PostModel } from '../../models/Post'

export interface GetPostByIdInputDTO {
    id: string,
    token: string
}

export type GetPostByIdOutputDTO = PostModel[]

export const GetPostByIdSchema = z.object({
    id: z.string().min(1),
    token: z.string().min(1)
}).transform(data => data as GetPostByIdInputDTO)