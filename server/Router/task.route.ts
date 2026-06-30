import {createTask, deleteTask, getAllTasks, taskExecute, updateTask} from "../controller/task.controller"
import express from "express";
import protectedRoute from "../Middleware/protected";
import {getComprehensiveInsights, getProductivityRecommendations} from "../controller/productivity.controller";

const taskRouter = express.Router();

taskRouter.post('/create', protectedRoute, createTask)
taskRouter.post('/:id/execute', protectedRoute, taskExecute)
taskRouter.get('/recommendations', protectedRoute, getProductivityRecommendations)
taskRouter.get('/insights', protectedRoute, getComprehensiveInsights)
taskRouter.get('/tasks', protectedRoute, getAllTasks)
taskRouter.get('/:id', protectedRoute, updateTask)
taskRouter.get('/:id', protectedRoute, deleteTask)

export default taskRouter;