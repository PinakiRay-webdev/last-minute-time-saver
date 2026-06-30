"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewProfile = exports.login = exports.register = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../model/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const register = async (req, res) => {
    const { name, email, password, profession, timezone, preferences } = req.body;
    try {
        const isUser = await user_model_1.default.findOne({ email });
        if (isUser) {
            res.status(400).json({ status: "error", message: "User already exists" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new user_model_1.default({
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
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            res.status(404).send({
                status: "error",
                message: "Email Id not registered!! Please register",
            });
            return;
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            res.status(400).send({ status: "error", message: "Invalid password" });
            return;
        }
        const payload = { id: user?._id };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.cookie("token", token, { httpOnly: true });
        res
            .status(200)
            .send({ status: "success", message: "Loggedin successfully!" });
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
    }
};
exports.login = login;
const viewProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log(req.user);
        const user = await user_model_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).send({ status: 'Not found', message: "User not found" });
            return;
        }
        res.status(200).send({ status: 'success', profileData: user });
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
    }
};
exports.viewProfile = viewProfile;
