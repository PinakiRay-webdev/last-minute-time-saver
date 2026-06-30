"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_route_1 = __importDefault(require("./Router/user.route"));
const task_route_1 = __importDefault(require("./Router/task.route"));
const dashboard_route_1 = __importDefault(require("./Router/dashboard.route"));
const app = (0, express_1.default)();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/auth", user_route_1.default);
app.use("/api/task", task_route_1.default);
app.use("/api/dashboard", dashboard_route_1.default);
app.get('/api/test', (req, res) => {
    res.status(200).send({ status: 'success', message: 'Welcome to the last minute life saver backend' });
});
exports.default = app;
