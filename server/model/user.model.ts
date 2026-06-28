import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profession: string;
  timezone: string;
  aiTone: "profession" | "casual" | "concise";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    profession: {
      type: String,
      required: [true, "Please enter your profession"],
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    aiTone: {
      type: String,
      enum: ["professional", "casual", "concise"],
      default: "professional",
    },
  },
  {
    timestamps: true,
  },
);

const USER = mongoose.model<IUser>("User", userSchema);

export default USER;
