"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("../controller/dashboard.controller");
const protected_1 = __importDefault(require("../Middleware/protected"));
const dashboardRoute = express_1.default.Router();
dashboardRoute.get('/getinfo', protected_1.default, dashboard_controller_1.getDashboardData);
exports.default = dashboardRoute;
