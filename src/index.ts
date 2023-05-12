import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./routers/userRouter";
import { commentRouter } from "./routers/commentRouter";
import { postRouter } from "./routers/postRouter";

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.listen(Number(process.env.PORT) || 3003, () => {
    console.log(`Servidor rodando na porta ${Number(process.env.PORT) || 3003}`)
})

app.use('/users', userRouter)

app.use('/posts', postRouter)

app.use('/comments', commentRouter)