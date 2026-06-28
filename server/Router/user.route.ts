import express, {Request, Response} from "express";
import {login, register, viewProfile} from "../controller/user.controller";
import protectedRoute from "../Middleware/protected";

const userRouter = express.Router();

interface AuthRequest extends Request{
    user? : string;
}

userRouter.post('/login', login)
userRouter.post('/register', register)

userRouter.get('/profile', protectedRoute, viewProfile)

export default userRouter;
