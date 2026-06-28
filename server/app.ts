import express, {Application, Request, Response} from "express"
import cors from "cors"
import userRouter from "./Router/user.route";
import taskRouter from "./Router/task.route";
const app:Application = express()

app.use(cors())
app.use(express.json())
app.use("/api/auth", userRouter)
app.use("/api/task", taskRouter)

app.get('/api/test', (req:Request,res:Response):void =>{
    res.status(200).send({status: 'success', message: 'Welcome to the last minute life saver backend'})
})

export default app