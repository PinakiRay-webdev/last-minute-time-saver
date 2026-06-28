import dotenv from "dotenv";
import { Request, Response } from "express";
import USER from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthRequest} from "../Middleware/protected";

dotenv.config();

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, profession, timezone, preferences } = req.body;
  try {
    const isUser = await USER.findOne({ email });

    if (isUser) {
      res.status(400).json({ status: "error", message: "User already exists" });
      return;
    }

    const hashedPassword:string = await bcrypt.hash(password, 10);

    const newUser = new USER({
      name,
      email,
      password: hashedPassword,
      profession,
      timezone,
      preferences,
    });

    await newUser.save();

    res
      .status(201)
      .send({ status: "success", message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ status: "error", message: error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      res.status(404).send({
        status: "error",
        message: "Email Id not registered!! Please register",
      });
      return;
    }

    const isValid: boolean = await bcrypt.compare(password, user.password);

    if (!isValid) {
      res.status(400).send({ status: "error", message: "Invalid password" });
      return;
    }

    const payload = { id: user?._id };
    const token: string = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { httpOnly: true});
    res
      .status(200)
      .send({ status: "success", message: "Loggedin successfully!" });
  } catch (error) {
    res.status(500).send({ status: "error", message: error });
  }
};

export const viewProfile = async(req:AuthRequest, res:Response):Promise<void> =>{
  try{
    const userId = req.user?.id

    console.log(req.user)

    const user = await USER.findById(userId).select("-password")

    if(!user){
      res.status(404).send({status: 'Not found', message: "User not found"})
      return;
    }

    res.status(200).send({status: 'success', profileData: user});

  }catch (error){
    res.status(500).send({ status: "error", message: error });
  }
}