"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestTaskTitles = exports.getProductivityInsights = exports.executeActionWithAI = exports.suggestAlternativeTime = exports.analyzeTaskWithAI = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const genai_1 = require("@google/genai");
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
const analyzeTaskWithAI = async (taskTitle, description = "") => {
    try {
        const now = new Date();
        const currentContext = now.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        const prompt = `You are a precise backend JSON micro-service. Your job is to extract task details and return ONLY raw JSON.

    Current System Date & Time (IST): ${currentContext}
    
    ### CLASSIFICATION RULES:
    1. 'aiActionType': Must be one of ["draft_email", "summarize_doc", "breakdown_tasks", "research", "create_explanation", "default"]. 
       - Use 'research' for finding information, suggesting places, or planning trips/itineraries.
       - Use 'breakdown_tasks' for large projects needing sub-steps (like coding a feature).
       - Use 'default' ONLY for simple chores, meetings, or if absolutely nothing else fits.
    2. 'suggestedStartDateTime' & 'suggestedEndDateTime': Format as "YYYY-MM-DDTHH:mm". If relative ("tomorrow at 5 pm"), calculate from Current System Date. If duration is missing, assume 1 hour. If NO specific time is mentioned, return null.
    3. 'isBlockingEvent': true ONLY if it's a meeting, interview, date, or appointment requiring presence at a specific time. false for flexible chores, planning, or research.
    4. 'priorityScore': Rate strictly from 1 to 10 based on urgency.

    ### EXAMPLES (LEARN FROM THESE):
    
    Input: Title: "Spiti Trip", Description: "Plan my complete spiti circuit trip for 5 days"
    Output: {"priorityScore": 6, "aiActionType": "research", "suggestedStartDateTime": null, "suggestedEndDateTime": null, "isBlockingEvent": false}
    
    Input: Title: "Interview", Description: "Schedule interview tomorrow at 4 pm"
    Output: {"priorityScore": 9, "aiActionType": "default", "suggestedStartDateTime": "2026-06-29T16:00", "suggestedEndDateTime": "2026-06-29T17:00", "isBlockingEvent": true}
    
    Input: Title: "OOPs explanation", Description: "Explain me the concepts of OOPs immedietly"
    Output: {"priorityScore": 7, "aiActionType": "create_explanation", "suggestedStartDateTime": null, "suggestedEndDateTime": null, "isBlockingEvent": false}

    ### NOW PROCESS THIS REAL INPUT:
    Input: Title: "${taskTitle}", Description: "${description}"
    Output:
    `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a precise backend micro-service. Always return raw JSON without markdown.",
                responseMimeType: "application/json",
            },
        });
        const rawText = response.text || "{}";
        const data = JSON.parse(rawText);
        return data;
    }
    catch (error) {
        console.error("Error in Gemini API Service:", error);
        throw new Error("Failed to analyze task with AI due to an external service error.");
    }
};
exports.analyzeTaskWithAI = analyzeTaskWithAI;
const suggestAlternativeTime = async (blockedUntil) => {
    try {
        const prompt = `
        The user has a schedule conflict and is busy until EXACTLY "${blockedUntil}".
        Suggest the next best available 1-hour slot starting right after this time or later.
        Return ONLY the updated start date-time string strictly in "YYYY-MM-DDTHH:mm" format. No text.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text?.trim() || blockedUntil;
    }
    catch (error) {
        return blockedUntil;
    }
};
exports.suggestAlternativeTime = suggestAlternativeTime;
const executeActionWithAI = async (actionType, title, description) => {
    try {
        let prompt = "";
        switch (actionType) {
            case "draft_email":
                prompt = `Write a professional email based on this request. \nSubject: ${title}\nContext: ${description}`;
                break;
            case "summarize_doc":
                prompt = `Provide a clear, bulleted summary with action items. \nTitle: ${title}\nContext: ${description}`;
                break;
            case "breakdown_tasks":
                prompt = `Break down this project into a step-by-step checklist. \nGoal: ${title}\nContext: ${description}`;
                break;
            case "create_explanation":
                prompt = `Explain the following topic clearly. \nTopic: ${title}\nContext: ${description}`;
                break;
            case "research":
                prompt = `Provide a quick research summary. \nTopic: ${title}\nContext: ${description}`;
                break;
            case "default":
            default:
                return "No automated action required for this task type.";
        }
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful AI assistant. Provide clear, direct markdown text without conversational filler.",
            },
        });
        return response.text || "Failed to generate content.";
    }
    catch (error) {
        return "Error occurred while generating AI response.";
    }
};
exports.executeActionWithAI = executeActionWithAI;
const getProductivityInsights = async (tasks) => {
    try {
        const taskSummary = tasks.map((t) => ({
            title: t.title,
            status: t.status,
            isBlocking: t.isBlockingEvent,
            priority: t.priorityScore,
        }));
        const prompt = `
        Analyze this complete history of the user's tasks and act as a professional Productivity Coach.
        Tasks Data: ${JSON.stringify(taskSummary)}

        Rules:
        1. Identify long-term patterns (e.g., completion rate, preference for blocking vs non-blocking tasks, priority handling).
        2. Give a deep dive into their productivity habits.
        3. Provide 3 highly actionable, strategic tips to improve their workflow.
        4. Keep it encouraging but direct.
        5. Provide the response in clear, concise markdown text.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return (response.text ||
            "Keep up the good work! You are managing your tasks well.");
    }
    catch (error) {
        return error.message || "Failed to generate insights.";
    }
};
exports.getProductivityInsights = getProductivityInsights;
const suggestTaskTitles = async (tasks) => {
    try {
        const taskTitles = tasks.map((t) => t.title);
        const prompt = `
        You are a smart task-prediction engine. The user recently added or worked on these 5 tasks:
        Recent Tasks: ${JSON.stringify(taskTitles)}

        Based on these recent activities, suggest 4 to 6 short, natural follow-up tasks or daily routine tasks the user might want to do next.
        
        Rules:
        1. Return ONLY a raw JSON array of strings. No markdown, no conversational text.
        2. Keep titles short and actionable (max 5-6 words).
        3. Examples of output format: ["Follow up with client", "Review weekly code", "Plan weekend trip", "Buy groceries"]
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a precise backend micro-service. Always return a raw JSON array of strings.",
                responseMimeType: "application/json",
            },
        });
        const rawText = response.text || "[]";
        const suggestions = JSON.parse(rawText);
        return suggestions.slice(0, 6);
    }
    catch (error) {
        console.error("Error in suggestTaskTitles:", error);
        return [
            "Review pending tasks",
            "Check emails",
            "Plan tomorrow's schedule",
            "Drink water & stretch",
        ];
    }
};
exports.suggestTaskTitles = suggestTaskTitles;
