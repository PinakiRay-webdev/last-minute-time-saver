"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Task from "./Task";
import { XIcon, SparkleIcon, SpinnerGapIcon, CopyIcon, CheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View/Execute Modal States
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

  // Create Task States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // 🔥 Edit Task States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [conflictData, setConflictData] = useState<{ message: string; suggestedAlternative: string; } | null>(null);

  const fetchAllTasks = async () => {
    try {
      const res = await api.get("/api/task/tasks");
      if (res.data.status === "success") {
        setTasks(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load tasks", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  /* --- ACTIONS LOGIC (Delete, Mark Complete, Edit) --- */
  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/api/task/${taskId}`);
      toast.success("Task deleted!", { theme: "dark" });
      fetchAllTasks();
    } catch (error) {
      toast.error("Failed to delete task", { theme: "dark" });
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      await api.put(`/api/task/${taskId}`, { status: "completed" });
      toast.success("Task marked as completed! ✅", { theme: "dark" });
      fetchAllTasks();
    } catch (error) {
      toast.error("Failed to update status", { theme: "dark" });
    }
  };

  const handleOpenEdit = (task: any) => {
    setEditTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error("Title is required", { theme: "dark" });
      return;
    }
    setIsEditing(true);
    try {
      await api.put(`/api/task/${editTaskId}`, { title: editTitle, description: editDescription });
      toast.success("Task updated successfully!", { theme: "dark" });
      setIsEditModalOpen(false);
      fetchAllTasks();
    } catch (error) {
      toast.error("Failed to update task", { theme: "dark" });
    } finally {
      setIsEditing(false);
    }
  };

  /* --- CREATE LOGIC --- */
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setSuggestions([]);
  };

  const handleGetRecommendations = async () => {
    setIsFetchingSuggestions(true);
    try {
      const res = await api.get("/api/task/recommendations");
      if (res.data.status === "success" && Array.isArray(res.data.data)) {
        setSuggestions(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load suggestions", { theme: "dark" });
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDescription.trim()) {
      toast.error("Please provide both title and description", { theme: "dark" });
      return;
    }
    setIsCreating(true);
    try {
      await api.post("/api/task/create", { title: taskTitle, description: taskDescription });
      toast.success("Task added successfully! 🚀", { theme: "dark" });
      setTaskTitle(""); setTaskDescription(""); setIsCreateModalOpen(false); setSuggestions([]);
      setLoading(true); await fetchAllTasks();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setIsCreateModalOpen(false);
        setConflictData({ message: err.response.data.message, suggestedAlternative: err.response.data.suggestedAlternative });
      } else {
        toast.error(err.response?.data?.message || "Failed to add task", { theme: "dark" });
      }
    } finally {
      setIsCreating(false);
    }
  };

  /* --- EXECUTE & VIEW LOGIC --- */
  const handleTryExecute = async (task: any) => {
    setExecutingTaskId(task._id);
    try {
      const res = await api.post(`/api/task/${task._id}/execute`);
      const output = res.data?.data?.aiOutput || "Task executed successfully! Check database for output.";
      setSelectedTask(task);
      setModalContent(output);
      toast.success("Task executed successfully! 🚀", { theme: "dark" });
      fetchAllTasks();
      setIsOutputModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to execute task", { theme: "dark" });
    } finally {
      setExecutingTaskId(null);
    }
  };

  const handleView = (task: any) => {
    setSelectedTask(task);
    setModalContent(task.aiOutput);
    setIsCopied(false);
    setIsOutputModalOpen(true);
  };

  const closeOutputModal = () => {
    setIsOutputModalOpen(false);
    setTimeout(() => { setSelectedTask(null); setModalContent(null); setIsCopied(false); }, 200);
  };

  const handleCopy = () => {
    if (modalContent) {
      navigator.clipboard.writeText(modalContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
      <div className="h-full relative">
        <Task
            tasks={tasks}
            loading={loading}
            executingTaskId={executingTaskId}
            onTryExecute={handleTryExecute}
            onView={handleView}
            onAddTask={handleOpenCreateModal}
            onEdit={handleOpenEdit}         // 🔥 Passed Prop
            onDelete={handleDelete}         // 🔥 Passed Prop
            onMarkComplete={handleMarkComplete} // 🔥 Passed Prop
        />

        {/* --- 1. CREATE TASK MODAL --- */}
        {isCreateModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1f2937] border border-gray-700/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition"><XIcon size={24} /></button>
                <h3 className="text-xl font-bold text-white mb-6">Plan a New Task</h3>
                <form onSubmit={handleCreateTask} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">What needs to be done?</label>
                    <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} disabled={isCreating} placeholder="e.g., Spiti Circuit Trip..." className="w-full bg-[#111827] border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm disabled:opacity-50" autoFocus />
                    <div className="mt-2 min-h-[28px]">
                      {suggestions.length === 0 && !isFetchingSuggestions ? (
                          <button type="button" onClick={handleGetRecommendations} className="text-xs font-medium text-indigo-400 flex items-center gap-1.5 hover:text-indigo-300 transition-colors">
                            <SparkleIcon weight="duotone" /> Get recommendations from past
                          </button>
                      ) : isFetchingSuggestions ? (
                          <div className="text-xs text-gray-400 flex items-center gap-1.5"><SpinnerGapIcon className="animate-spin text-indigo-500" /> Analyzing past activity...</div>
                      ) : (
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <button key={index} type="button" onClick={() => setTaskTitle(suggestion)} className="text-[11px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors text-left">{suggestion}</button>
                            ))}
                          </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Details & Timing</label>
                    <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} disabled={isCreating} placeholder="Provide details, dates, or duration..." rows={4} className="w-full bg-[#111827] border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm resize-none disabled:opacity-50" />
                  </div>
                  <button disabled={isCreating} type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-lg shadow-indigo-900/20 disabled:opacity-50">
                    {isCreating ? <span className="flex items-center gap-2"><SpinnerGapIcon className="animate-spin" /> AI is Analyzing...</span> : "Analyze & Create Task"}
                  </button>
                </form>
              </div>
            </div>
        )}

        {/* --- 🔥 1.5 EDIT TASK MODAL 🔥 --- */}
        {isEditModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1f2937] border border-gray-700/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition"><XIcon size={24} /></button>
                <h3 className="text-xl font-bold text-white mb-6">Edit Task</h3>
                <form onSubmit={handleUpdateTask} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Task Title</label>
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={isEditing} className="w-full bg-[#111827] border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm disabled:opacity-50" autoFocus />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} disabled={isEditing} rows={4} className="w-full bg-[#111827] border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm resize-none disabled:opacity-50" />
                  </div>
                  <button disabled={isEditing} type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-lg shadow-indigo-900/20 disabled:opacity-50">
                    {isEditing ? <SpinnerGapIcon className="animate-spin" size={20}/> : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
        )}

        {/* --- 2. CONFLICT MODAL --- */}
        {conflictData && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1f2937] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center gap-3 text-red-400 mb-4"><WarningCircleIcon size={32} weight="fill" /><h3 className="text-xl font-bold text-white">Schedule Conflict!</h3></div>
                <p className="text-gray-300 mb-4 leading-relaxed">{conflictData.message}</p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mb-6">
                  <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">AI Suggestion</p>
                  <p className="text-white font-medium">Free Slot: {formatDateTime(conflictData.suggestedAlternative)}</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConflictData(null)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">Cancel</button>
                  <button onClick={() => setConflictData(null)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition">Got it</button>
                </div>
              </div>
            </div>
        )}

        {/* --- 3. AI OUTPUT MODAL (PREMIUM) --- */}
        {isOutputModalOpen && selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
              <div className="bg-[#1f2937] border border-gray-700/60 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#111827]">
                  <div className="flex items-center gap-3 text-indigo-400">
                    <div className="p-2 bg-indigo-500/10 rounded-lg"><SparkleIcon size={24} weight="duotone" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{modalLoading ? "Generating AI Output..." : "AI Output"}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px] sm:max-w-sm">{selectedTask.title}</p>
                    </div>
                  </div>
                  {!modalLoading && (
                      <div className="flex items-center gap-2">
                        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-700">
                          {isCopied ? <CheckIcon size={16} className="text-emerald-400" /> : <CopyIcon size={16} />} {isCopied ? "Copied!" : "Copy"}
                        </button>
                        <button onClick={closeOutputModal} className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 p-1.5 rounded-lg transition-colors"><XIcon size={20} /></button>
                      </div>
                  )}
                </div>
                <div className="p-1 overflow-y-auto flex-1 bg-[#0f1523] custom-scrollbar">
                  <div className="p-6 sm:p-8 min-h-[300px] flex flex-col">
                    {modalLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16">
                          <div className="relative flex items-center justify-center"><div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div><SpinnerGapIcon size={56} className="text-indigo-400 animate-spin relative z-10" /></div>
                          <p className="text-gray-200 font-bold text-lg mt-6">Analyzing & Planning...</p>
                          <p className="text-gray-500 text-sm mt-2 text-center max-w-md">Our AI is processing your request and gathering the best information. This usually takes a few seconds.</p>
                        </div>
                    ) : modalContent ? (
                        <div className="text-gray-300 text-sm sm:text-base leading-relaxed tracking-wide space-y-4 [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:text-white [&>h1]:mb-6 [&>h1]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:border-b [&>h2]:border-gray-800 [&>h2]:pb-2 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-indigo-300 [&>h3]:mb-3 [&>h3]:mt-6 [&>p]:mb-4 [&>p]:leading-7 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul>li]:mb-2 [&>ul>li]:pl-1 [&>ul>li::marker]:text-indigo-500 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5 [&>ol>li]:mb-2 [&>ol>li]:pl-1 [&>strong]:text-white [&>strong]:font-semibold [&>hr]:border-gray-800 [&>hr]:my-8 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-400">
                          <ReactMarkdown>{modalContent}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col"><p className="text-gray-500 text-lg">No output generated.</p></div>
                    )}
                  </div>
                </div>
                {!modalLoading && (
                    <div className="px-6 py-4 border-t border-gray-800 bg-[#111827] flex justify-end">
                      <button onClick={closeOutputModal} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-900/20">Done</button>
                    </div>
                )}
              </div>
            </div>
        )}

        <ToastContainer />
        <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 20px; border: 2px solid #0f1523; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #4b5563; }
      `}} />
      </div>
  );
}