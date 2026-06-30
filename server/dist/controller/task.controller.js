"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getAllTasks = exports.taskExecute = exports.createTask = void 0;
const task_model_1 = __importDefault(require("../model/task.model"));
const ai_service_1 = require("../Services/ai.service");
const createTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user?.id;
        if (!title) {
            res.status(400).json({ status: "error", message: "Title is required" });
            return;
        }
        const aiAssessment = await (0, ai_service_1.analyzeTaskWithAI)(title, description);
        // NAYA LOGIC: Interval Overlap Checking using Start and End times
        if (aiAssessment.suggestedStartDateTime && aiAssessment.suggestedEndDateTime && aiAssessment.isBlockingEvent) {
            const conflictingTask = await task_model_1.default.findOne({
                user: userId,
                isBlockingEvent: true,
                $and: [
                    { suggestedStartDateTime: { $lt: aiAssessment.suggestedEndDateTime } }, // Existing start < New end
                    { suggestedEndDateTime: { $gt: aiAssessment.suggestedStartDateTime } } // Existing end > New start
                ]
            });
            if (conflictingTask) {
                // AI ko purane task ka End Time bhej rahe hain
                const alternateTime = await (0, ai_service_1.suggestAlternativeTime)(conflictingTask.suggestedEndDateTime);
                res.status(409).json({
                    status: "conflict",
                    message: `Conflict Detected! You are busy with "${conflictingTask.title}" from ${conflictingTask.suggestedStartDateTime} to ${conflictingTask.suggestedEndDateTime}.`,
                    suggestedAlternative: alternateTime
                });
                return;
            }
        }
        const newTask = new task_model_1.default({
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
    }
    catch (error) {
        console.error("Task Creation Error:", error);
        res.status(500).json({ status: "error", message: "Server error while creating task" });
    }
};
exports.createTask = createTask;
const taskExecute = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user?.id;
        const task = await task_model_1.default.findOne({ _id: taskId, user: userId });
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
        const generateOutput = await (0, ai_service_1.executeActionWithAI)(task.aiActionType, task.title, task.description);
        task.aiOutput = generateOutput;
        task.status = "completed";
        await task.save();
        res.status(200).send({ status: "success", message: "Task executed", data: task });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error.message || "Internal server error" });
    }
};
exports.taskExecute = taskExecute;
const getAllTasks = async (req, res) => {
    try {
        const userId = req.user?.id;
        const tasks = await task_model_1.default.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ status: "success", results: tasks.length, data: tasks });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Server error while fetching tasks" });
    }
};
exports.getAllTasks = getAllTasks;
const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user?.id;
        const task = await task_model_1.default.findOne({ _id: taskId, user: userId });
        if (!task) {
            res.status(404).json({ status: "error", message: "Task not found" });
            return;
        }
        res.status(200).json({ status: "success", data: task });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Server error while fetching the task" });
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user?.id;
        const { title, description, status } = req.body;
        const task = await task_model_1.default.findOne({ _id: taskId, user: userId });
        if (!task) {
            res.status(404).json({ status: "error", message: "Task not found" });
            return;
        }
        if (title)
            task.title = title;
        if (description)
            task.description = description;
        if (status)
            task.status = status;
        await task.save();
        res.status(200).json({ status: "success", message: "Task updated successfully", data: task });
    }
    catch (error) {
        console.error("Task Update Error:", error);
        res.status(500).json({ status: "error", message: "Server error while updating task" });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user?.id;
        const task = await task_model_1.default.findOneAndDelete({ _id: taskId, user: userId });
        if (!task) {
            res.status(404).json({ status: "error", message: "Task not found" });
            return;
        }
        res.status(200).json({ status: "success", message: "Task deleted successfully" });
    }
    catch (error) {
        console.error("Task Delete Error:", error);
        res.status(500).json({ status: "error", message: "Server error while deleting task" });
    }
};
exports.deleteTask = deleteTask;
