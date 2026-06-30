"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user.controller");
const protected_1 = __importDefault(require("../Middleware/protected"));
const userRouter = express_1.default.Router();
userRouter.post('/login', user_controller_1.login);
userRouter.post('/register', user_controller_1.register);
userRouter.get('/profile', protected_1.default, user_controller_1.viewProfile);
exports.default = userRouter;
