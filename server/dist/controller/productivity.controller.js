"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductivityRecommendations = exports.getComprehensiveInsights = void 0;
const task_model_1 = __importDefault(require("../model/task.model"));
const ai_service_1 = require("../Services/ai.service");
const getComprehensiveInsights = async (req, res) => {
    try {
        const userId = req.user?.id;
        const allTasks = await task_model_1.default.find({ user: userId }).sort({ createdAt: -1 });
        if (allTasks.length === 0) {
            res
                .status(200)
                .json({
                status: "success",
                data: "No data yet. Start adding tasks to get your personalized productivity insights!",
            });
            return;
        }
        const insights = await (0, ai_service_1.getProductivityInsights)(allTasks);
        res.status(200).json({ status: "success", data: insights });
    }
    catch (error) {
        console.error("Error generating insights:", error);
        res
            .status(500)
            .json({ status: "error", message: "Failed to generate insights" });
    }
};
exports.getComprehensiveInsights = getComprehensiveInsights;
const getProductivityRecommendations = async (req, res) => {
    try {
        const userId = req.user?.id;
        const recentTasks = await task_model_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);
        const suggestions = await (0, ai_service_1.suggestTaskTitles)(recentTasks);
        res.status(200).json({ status: "success", data: suggestions });
    }
    catch (error) {
        console.error("Error generating recommendations:", error);
        res
            .status(500)
            .json({
            status: "error",
            message: "Failed to generate task recommendations",
        });
    }
};
exports.getProductivityRecommendations = getProductivityRecommendations;
