"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protectedRoute = async (req, res, next) => {
    const token = req.cookies.token;
    try {
        if (!token) {
            res.status(401).send({
                status: "unauthorized",
                message: "No token provided"
            });
            return;
        }
        const verifyToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = verifyToken;
        next();
    }
    catch (error) {
        res.status(401).send({ status: 'error', message: error });
    }
};
exports.default = protectedRoute;
