# Vibe2Ship: The Last-Minute Life Saver 🚀

An AI-powered proactive productivity companion designed to help students, professionals, and entrepreneurs plan, prioritize, and execute tasks before deadlines are missed. Moving beyond passive reminders, this application utilizes AI to make intelligent scheduling decisions and act on behalf of the user.

## 🌟 Core Features

*   **Intelligent Task Prioritization:** Analyzes natural language input to assign priority scores.
*   **AI-Powered Scheduling:** Automatically detects schedule conflicts and suggests alternative time slots.
*   **Autonomous Task Execution:** Uses AI to draft emails, summarize documents, or break down large projects into actionable steps.
*   **Productivity Insights:** Provides personalized recommendations based on recent user activity and task completion rates.

## 🛠️ Tech Stack

*   **Frontend (Client):** Next.js, TypeScript, Tailwind CSS
*   **Backend (Server):** Node.js, Express.js, TypeScript
*   **Database:** MongoDB & Mongoose
*   **AI Integration:** Google Gemini API (gemini-2.5-flash)
*   **Authentication:** JWT (JSON Web Tokens) & bcryptjs

## 📁 Project Structure

This is a monorepo containing both the frontend client and the backend server.

```text
vibe2ship/
├── client/       # Next.js Frontend application
├── server/       # Node.js/Express Backend application
├── .gitignore
└── README.md