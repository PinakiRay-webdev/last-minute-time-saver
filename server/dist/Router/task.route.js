"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_controller_1 = require("../controller/task.controller");
const express_1 = __importDefault(require("express"));
const protected_1 = __importDefault(require("../Middleware/protected"));
const productivity_controller_1 = require("../controller/productivity.controller");
const taskRouter = express_1.default.Router();
taskRouter.post('/create', protected_1.default, task_controller_1.createTask);
taskRouter.post('/:id/execute', protected_1.default, task_controller_1.taskExecute);
taskRouter.get('/recommendations', protected_1.default, productivity_controller_1.getProductivityRecommendations);
taskRouter.get('/insights', protected_1.default, productivity_controller_1.getComprehensiveInsights);
taskRouter.get('/tasks', protected_1.default, task_controller_1.getAllTasks);
taskRouter.get('/:id', protected_1.default, task_controller_1.updateTask);
taskRouter.get('/:id', protected_1.default, task_controller_1.deleteTask);
exports.default = taskRouter;
