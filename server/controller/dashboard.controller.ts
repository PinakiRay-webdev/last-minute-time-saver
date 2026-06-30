import TASK from "../model/task.model";
import { Response } from "express";
import { AuthRequest } from "../Middleware/protected";

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const allTasks = await TASK.find({user: userId})

    const dashboardData = {
      stats: {
        total: allTasks.length,
        pending: allTasks.filter((t) => t.status === "pending").length,
        completed: allTasks.filter((t) => t.status === "completed").length,
      },
      highPriority: allTasks
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 3),
      upcoming: allTasks.filter(
        (t) => t.isBlockingEvent && t.suggestedStartDateTime,
      ),
    };

    res.status(200).send({status: 'success', data: dashboardData});

  } catch (error) {
    res.status(500).send({ status: 500, message: error });
  }
};

