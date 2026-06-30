import { Response } from "express";
import TASK from "../model/task.model";
import { analyzeTaskWithAI, executeActionWithAI, suggestAlternativeTime } from "../Services/ai.service";
import { AuthRequest } from "../Middleware/protected";

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description } = req.body;
        const userId = (req.user as any)?.id;

        if (!title) {
            res.status(400).json({ status: "error", message: "Title is required" });
            return;
        }

        const aiAssessment = await analyzeTaskWithAI(title, description);

        // NAYA LOGIC: Interval Overlap Checking using Start and End times
        if (aiAssessment.suggestedStartDateTime && aiAssessment.suggestedEndDateTime && aiAssessment.isBlockingEvent) {

            const conflictingTask = await TASK.findOne({
                user: userId,
                isBlockingEvent: true,
                $and: [
                    { suggestedStartDateTime: { $lt: aiAssessment.suggestedEndDateTime } }, // Existing start < New end
                    { suggestedEndDateTime: { $gt: aiAssessment.suggestedStartDateTime } }  // Existing end > New start
                ]
            });

            if (conflictingTask) {
                // AI ko purane task ka End Time bhej rahe hain
                const alternateTime = await suggestAlternativeTime(conflictingTask.suggestedEndDateTime as string);
                res.status(409).json({
                    status: "conflict",
                    message: `Conflict Detected! You are busy with "${conflictingTask.title}" from ${conflictingTask.suggestedStartDateTime} to ${conflictingTask.suggestedEndDateTime}.`,
                    suggestedAlternative: alternateTime
                });
                return;
            }
        }

        const newTask = new TASK({
            user: userId,
            title,
            description,
            priorityScore: aiAssessment.priorityScore,
            aiActionType: aiAssessment.aiActionType,
            suggestedStartDateTime: aiAssessment.suggestedStartDateTime,
            suggestedEndDateTime: aiAssessment.suggestedEndDateTime,
            isBlockingEvent: aiAssessment.isBlockingEvent,
        });

        await newTask.save();

        res.status(201).json({
            status: "success",
            message: "Task categorized and saved successfully",
            data: newTask
        });

    } catch (error) {
        console.error("Task Creation Error:", error);
        res.status(500).json({ status: "error", message: "Server error while creating task" });
    }
};

export const taskExecute = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taskId = req.params.id;
        const userId = (req.user as any)?.id;

        const task = await TASK.findOne({ _id: taskId, user: userId });

        if (!task) {
            res.status(404).send({ status: "not found", message: "Task not found or unauthorized" });
            return;
        }

        if (task.aiActionType === "default") {
            task.status = "completed";
            task.aiOutput = "Event scheduled successfully on your app calendar. (No AI integration used here).";
            await task.save();
            res.status(200).send({ status: "success", message: "Task completed successfully", data: task });
            return;
        }

        const generateOutput = await executeActionWithAI(task.aiActionType, task.title, task.description);

        task.aiOutput = generateOutput;
        task.status = "completed";
        await task.save();

        res.status(200).send({ status: "success", message: "Task executed", data: task });

    } catch (error: any) {
        res.status(500).send({ status: 'error', message: error.message || "Internal server error" });
    }
};

export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = (req.user as any)?.id;
        const tasks = await TASK.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ status: "success", results: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error while fetching tasks" });
    }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taskId = req.params.id;
        const userId = (req.user as any)?.id;
        const task = await TASK.findOne({ _id: taskId, user: userId });

        if (!task) {
            res.status(404).json({ status: "error", message: "Task not found" });
            return;
        }
        res.status(200).json({ status: "success", data: task });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error while fetching the task" });
    }
};


export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taskId = req.params.id;
        const userId = (req.user as any)?.id;
        const { title, description, status } = req.body;

        const task = await TASK.findOne({ _id: taskId, user: userId });

        if (!task) {
            res.status(404).json({ status: "error", message: "Task not found" });
            return;
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;

        await task.save();

        res.status(200).json({ status: "success", message: "Task updated successfully", data: task });
    } catch (error) {
        console.error("Task Update Error:", error);
        res.status(500).json({ status: "error", message: "Server error while updating task" });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taskId = req.params.id;
        const userId = (req.user as any)?.id;

        const task = await TASK.findOneAndDelete({ _id: taskId, user: userId });

        if (!task) {
            res.status(404).json({ status: "error", message: "Task not found" });
            return;
        }

        res.status(200).json({ status: "success", message: "Task deleted successfully" });
    } catch (error) {
        console.error("Task Delete Error:", error);
        res.status(500).json({ status: "error", message: "Server error while deleting task" });
    }
};