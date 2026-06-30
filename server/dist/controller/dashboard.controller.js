"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const task_model_1 = __importDefault(require("../model/task.model"));
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const allTasks = await task_model_1.default.find({ user: userId });
        const dashboardData = {
            stats: {
                total: allTasks.length,
                pending: allTasks.filter((t) => t.status === "pending").length,
                completed: allTasks.filter((t) => t.status === "completed").length,
            },
            highPriority: allTasks
                .sort((a, b) => b.priorityScore - a.priorityScore)
                .slice(0, 3),
            upcoming: allTasks.filter((t) => t.isBlockingEvent && t.suggestedStartDateTime),
        };
        res.status(200).send({ status: 'success', data: dashboardData });
    }
    catch (error) {
        res.status(500).send({ status: 500, message: error });
    }
};
exports.getDashboardData = getDashboardData;
