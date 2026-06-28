import {createTask, taskExecute} from "../controller/task.controller"
import express from "express";
import protectedRoute from "../Middleware/protected";
import {getProductivityRecommendations} from "../controller/productivity.controller";

const taskRouter = express.Router();

taskRouter.post('/create', protectedRoute, createTask)
taskRouter.post('/:id/execute', protectedRoute, taskExecute)
taskRouter.get('/recommendations', protectedRoute, getProductivityRecommendations)

export default taskRouter;