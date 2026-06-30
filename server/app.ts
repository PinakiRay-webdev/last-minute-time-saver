import express, {Application, Request, Response} from "express"
import cors from "cors"
import userRouter from "./Router/user.route";
import taskRouter from "./Router/task.route";
import dashboardRoute from "./Router/dashboard.route";
const app:Application = express()
import cookieParser from "cookie-parser";

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", userRouter)
app.use("/api/task", taskRouter)
app.use("/api/dashboard", dashboardRoute)

app.get('/api/test', (req:Request,res:Response):void =>{
    res.status(200).send({status: 'success', message: 'Welcome to the last minute life saver backend'})
})

export default app