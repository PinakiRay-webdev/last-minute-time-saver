import express from "express";
import {getDashboardData} from "../controller/dashboard.controller";
import protectedRoute from "../Middleware/protected";

const dashboardRoute = express.Router();

dashboardRoute.get('/getinfo', protectedRoute, getDashboardData)

export default dashboardRoute;