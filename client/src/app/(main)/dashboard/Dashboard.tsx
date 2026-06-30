"use client";
import React, { useState, useEffect } from "react";
import {
  PlusCircleIcon,
  TargetIcon,
  CheckCircleIcon,
  ClockIcon,
  SparkleIcon,
  CalendarBlankIcon,
  ArrowRightIcon,
  WarningCircleIcon,
  XIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import api from "../../../lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewMonthGrid
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";

export default function DashboardOverview({
  data,
  refreshData,
}: {
  data: any;
  refreshData: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{
    message: string;
    suggestedAlternative: string;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const nextTask =
    data.upcoming?.find((t: any) => t.status === "pending") || null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const plainDateTime = Temporal.PlainDateTime.from(dateString);
      const zonedDateTime = plainDateTime.toZonedDateTime("Asia/Kolkata");
      return zonedDateTime.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  const splitDateTime = (dateString: string) => {
    if (!dateString) return { date: "-", time: "-" };
    try {
      const plainDateTime = Temporal.PlainDateTime.from(dateString);
      const zonedDateTime = plainDateTime.toZonedDateTime("Asia/Kolkata");
      return {
        date: zonedDateTime.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        }),
        time: zonedDateTime.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (error) {
      return { date: "-", time: "-" };
    }
  };

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [createViewMonthGrid()],
    events: [],
    plugins: [eventsService],
    defaultView: "month-grid",
  });

  // Build Temporal.ZonedDateTime events and push them via the events service
  // AFTER the calendar instance exists.
  useEffect(() => {
    if (!data.upcoming) return;

    const formattedEvents = data.upcoming
      .filter((t: any) => t.suggestedStartDateTime && t.suggestedEndDateTime)
      .map((t: any) => {
        try {
          return {
            id: t._id,
            title: t.title,
            start: Temporal.ZonedDateTime.from(
              `${t.suggestedStartDateTime}+05:30[Asia/Kolkata]`
            ),
            end: Temporal.ZonedDateTime.from(
              `${t.suggestedEndDateTime}+05:30[Asia/Kolkata]`
            ),
            description: t.description || "",
          };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);

    if (formattedEvents.length > 0) {
      eventsService.set(formattedEvents);
    }
  }, [data.upcoming, eventsService]);

  const handleTriggerModal = (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.error("Please provide both title and description", {
        theme: "dark",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/task/create", {
        title: taskTitle,
        description: taskDescription,
      });
      toast.success("Task added successfully!", { theme: "dark" });
      setTaskTitle("");
      setTaskDescription("");
      setIsCreateModalOpen(false);
      setSuggestions([]);
      refreshData();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setIsCreateModalOpen(false);
        setConflictData({
          message: err.response.data.message,
          suggestedAlternative: err.response.data.suggestedAlternative,
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to add task", {
          theme: "dark",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto relative">
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1f2937] border border-gray-700/60 rounded-2xl p-6 max-w-lg w-full sm:w-[90%] md:w-full shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <XIcon size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              Plan a New Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  What needs to be done?
                </label>
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g., Spiti Circuit Trip..."
                  className="w-full bg-[#111827] border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm disabled:opacity-50"
                  autoFocus
                />

                <div className="mt-2 min-h-[28px]">
                  {suggestions.length === 0 && !isFetchingSuggestions ? (
                    <button
                      type="button"
                      onClick={handleGetRecommendations}
                      className="text-xs font-medium text-indigo-400 flex items-center gap-1.5 hover:text-indigo-300 transition-colors"
                    >
                      <SparkleIcon weight="duotone" /> Get recommendations from
                      past
                    </button>
                  ) : isFetchingSuggestions ? (
                    <div className="text-xs text-gray-400 flex items-center gap-1.5">
                      <SpinnerGapIcon className="animate-spin text-indigo-500" />{" "}
                      Analyzing past activity...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setTaskTitle(suggestion)}
                          className="text-[11px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Details & Timing
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Provide details, dates, or duration..."
                  rows={4}
                  className="w-full bg-[#111827] border border-gray-700 p-3 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm resize-none disabled:opacity-50"
                />
              </div>
              <button
                disabled={isLoading}
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-lg shadow-indigo-900/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <SpinnerGapIcon className="animate-spin" /> AI is
                    Analyzing...
                  </span>
                ) : (
                  "Analyze & Create Task"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {conflictData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1f2937] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <WarningCircleIcon size={32} weight="fill" />
              <h3 className="text-xl font-bold text-white">
                Schedule Conflict!
              </h3>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {conflictData.message}
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mb-6">
              <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider mb-1">
                AI Suggestion
              </p>
              <p className="text-white font-medium">
                Free Slot: {formatDateTime(conflictData.suggestedAlternative)}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConflictData(null)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setConflictData(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-900/20"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-2">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, get ready to crush your goals.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Focus */}
          <div className="bg-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
            <p className="text-indigo-200 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-1 relative z-10">
              Upcoming Focus
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 relative z-10">
              {nextTask?.title || "No urgent tasks!"}
            </h2>
            <p className="text-indigo-100 mb-2 opacity-90 relative z-10 line-clamp-2">
              {nextTask?.description || "Enjoy your free time."}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              label="Total Tasks"
              value={data.stats?.total || 0}
              icon={<TargetIcon size={24} />}
              color="indigo"
            />
            <StatCard
              label="Pending"
              value={data.stats?.pending || 0}
              icon={<ClockIcon size={24} />}
              color="amber"
            />
            <StatCard
              label="Completed"
              value={data.stats?.completed || 0}
              icon={<CheckCircleIcon size={24} />}
              color="emerald"
            />
          </div>

          {/* Calendar */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-white">
              <CalendarBlankIcon size={20} className="text-indigo-400" />
              <h3 className="text-lg font-bold">Your Schedule</h3>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden bg-white calendar-wrapper">
              {isMounted && <ScheduleXCalendar calendarApp={calendar} />}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Add New Task */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4">Add New Task</h3>
            <form onSubmit={handleTriggerModal} className="mt-auto">
              <button
                type="submit"
                className="w-full bg-[#1f2937] hover:bg-gray-700 text-gray-300 p-3.5 rounded-xl flex items-center justify-center gap-2 font-medium border border-gray-700 transition"
              >
                <PlusCircleIcon size={20} /> Let's Plan it out
              </button>
            </form>
          </div>

          {/* Insights Card */}
          <div className="bg-gradient-to-br from-[#111827] to-[#1e1b4b] border border-indigo-900/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-400 mb-3">
                <SparkleIcon size={24} weight="duotone" />
                <span className="font-bold tracking-wider uppercase text-xs">
                  AI Productivity Coach
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Your Daily Insights are Ready!
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                We've analyzed your recent tasks. Check out your personalized
                recommendations.
              </p>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-indigo-900/20"
              >
                View My Insights <ArrowRightIcon size={18} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .calendar-wrapper {
           min-height: 500px;
        }
      `,
        }}
      />
    </div>
  );
}

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-[#111827] border border-gray-800 p-5 sm:p-6 rounded-2xl flex items-center gap-4 shadow-sm w-full">
    <div
      className={`text-${color}-400 bg-${color}-500/10 p-3 rounded-xl border border-${color}-500/20`}
    >
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-xs sm:text-sm font-medium">{label}</p>
      <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
        {value}
      </h3>
    </div>
  </div>
);