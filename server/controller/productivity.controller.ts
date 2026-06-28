import { Response } from "express";
import TASK from "../model/task.model";
import { getProductivityInsights } from "../Services/ai.service"
import { AuthRequest } from "../Middleware/protected";

export const getProductivityRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = (req.user as any)?.id;
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const recentTasks = await TASK.find({
            user: userId,
            createdAt: { $gte: fiveDaysAgo }
        }).sort({ createdAt: -1 });

        if (recentTasks.length === 0) {
            res.status(200).json({ status: "success", message: "No data yet. Start adding tasks!" });
            return;
        }
        const insights = await getProductivityInsights(recentTasks);

        res.status(200).json({ status: "success", data: insights });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to generate recommendations" });
    }
};