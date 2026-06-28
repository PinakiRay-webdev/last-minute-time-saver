import {NextFunction, Response, Request} from "express";
import jwt from "jsonwebtoken"

export interface AuthRequest extends Request{
    user? : string
}

const protectedRoute = async (req:AuthRequest,res:Response, next:NextFunction):Promise<void> =>{
    const authHeaders = req.header("authorization");
    if(!authHeaders){
        res.status(401).send({
            status: "unauthorized",
            message: "Not authorized"
        });
        return;
    }

    try{
        const token = authHeaders.split(" ")[1]
        if(!token){
            res.status(401).send({
                status: "unauthorized",
                message: "No token provided"
            });
            return;
        }

        const verifyToken:string = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = verifyToken;
        next()
    }catch (error){
        res.status(401).send({status: 'error', message: error})
    }
}

export default protectedRoute