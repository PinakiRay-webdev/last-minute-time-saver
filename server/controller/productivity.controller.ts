import { Response } from "express";
import TASK from "../model/task.model";
import {
  getProductivityInsights,
  suggestTaskTitles,
} from "../Services/ai.service";
import { AuthRequest } from "../Middleware/protected";

export const getComprehensiveInsights = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    const allTasks = await TASK.find({ user: userId }).sort({ createdAt: -1 });

    if (allTasks.length === 0) {
      res
        .status(200)
        .json({
          status: "success",
          data: "No data yet. Start adding tasks to get your personalized productivity insights!",
        });
      return;
    }

    const insights = await getProductivityInsights(allTasks);
    res.status(200).json({ status: "success", data: insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to generate insights" });
  }
};

export const getProductivityRecommendations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;

    const recentTasks = await TASK.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const suggestions = await suggestTaskTitles(recentTasks);

    res.status(200).json({ status: "success", data: suggestions });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to generate task recommendations",
      });
  }
};
