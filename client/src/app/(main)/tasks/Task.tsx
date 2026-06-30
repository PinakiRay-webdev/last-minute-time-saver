"use client";

import React from "react";
import {
  CheckCircleIcon,
  SpinnerGapIcon,
  ListDashesIcon,
  LightningIcon,
  EyeIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  CheckIcon,
  CalendarBlankIcon,
  ClockIcon,
} from "@phosphor-icons/react";

interface TaskProps {
  tasks: any[];
  loading: boolean;
  executingTaskId: string | null;
  onTryExecute: (task: any) => void;
  onView: (task: any) => void;
  onAddTask: () => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onMarkComplete: (taskId: string) => void;
}

export default function Task({
  tasks,
  loading,
  executingTaskId,
  onTryExecute,
  onView,
  onAddTask,
  onEdit,
  onDelete,
  onMarkComplete,
}: TaskProps) {
  const splitDateTime = (dateString: string) => {
    if (!dateString) return { date: "-", time: "-" };
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "pending":
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-4 p-3 max-w-7xl mx-auto h-full flex flex-col justify-between">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white">My Tasks</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            View and manage all your planned events and AI tasks.
          </p>
        </div>
        <button
          onClick={onAddTask}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-900/20"
        >
          <PlusIcon size={20} weight="bold" />
          New Task
        </button>
      </header>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden flex-1 flex flex-col shadow-lg shadow-black/20">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#1f2937]/30">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ListDashesIcon size={20} className="text-indigo-400" />
            All Tasks ({tasks.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <SpinnerGapIcon
              size={40}
              className="text-indigo-500 animate-spin mb-4"
            />
            <p className="text-gray-400">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <CheckCircleIcon
              size={56}
              weight="duotone"
              className="text-gray-600 mb-4"
            />
            <p className="text-gray-300 font-bold text-xl mb-1">
              No tasks found
            </p>
            <p className="text-gray-500 text-sm">
              Click on 'New Task' to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1f2937]/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                    <th className="py-4 px-6 font-semibold w-[22%]">
                      Event Name
                    </th>
                    <th className="py-4 px-6 font-semibold w-[28%]">
                      Description
                    </th>
                    <th className="py-4 px-6 font-semibold">
                      Start Date & Time
                    </th>
                    <th className="py-4 px-6 font-semibold">End Date & Time</th>
                    <th className="py-4 px-6 font-semibold text-center">
                      Status
                    </th>
                    <th className="py-4 px-6 font-semibold text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {tasks.map((task: any) => {
                    const start = splitDateTime(task.suggestedStartDateTime);
                    const end = splitDateTime(task.suggestedEndDateTime);
                    const isExecuted =
                      task.status === "completed" || !!task.aiOutput;

                    return (
                      <tr
                        key={task._id}
                        className="hover:bg-gray-800/40 transition-colors group"
                      >
                        <td className="py-4 px-6 text-sm font-medium text-white">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className="truncate max-w-[200px]"
                              title={task.title}
                            >
                              {task.title}
                            </span>
                            {task.isBlockingEvent && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                URGENT
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-sm text-gray-400">
                          <p className="line-clamp-2" title={task.description}>
                            {task.description || "-"}
                          </p>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          {start.date !== "-" ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                                <CalendarBlankIcon className="text-gray-500" />{" "}
                                {start.date}
                              </span>
                              <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <ClockIcon className="text-gray-500" />{" "}
                                {start.time}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          {end.date !== "-" ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                                <CalendarBlankIcon className="text-gray-500" />{" "}
                                {end.date}
                              </span>
                              <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <ClockIcon className="text-gray-500" />{" "}
                                {end.time}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(task.status)}`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-2">
                            {task.aiActionType === "default" ? (
                              <div className="inline-flex items-center justify-center gap-1.5 bg-gray-800/40 text-gray-400 border border-gray-700/50 px-4 py-1.5 rounded-lg text-xs font-bold cursor-default select-none w-full max-w-[110px]">
                                <CheckCircleIcon
                                  size={14}
                                  weight="fill"
                                  className="text-emerald-500"
                                />{" "}
                                Planned
                              </div>
                            ) : isExecuted ? (
                              <button
                                onClick={() => onView(task)}
                                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors w-full max-w-[110px]"
                              >
                                <EyeIcon size={14} weight="bold" /> View Output
                              </button>
                            ) : (
                              <button
                                onClick={() => onTryExecute(task)}
                                disabled={executingTaskId === task._id}
                                className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 w-full max-w-[110px]"
                              >
                                {executingTaskId === task._id ? (
                                  <SpinnerGapIcon
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <LightningIcon size={14} weight="fill" />
                                )}
                                {executingTaskId === task._id
                                  ? "Wait..."
                                  : "Execute"}
                              </button>
                            )}

                            <div className="flex items-center gap-2 bg-gray-800/30 px-2 py-0.5 rounded border border-gray-800/60">
                              {task.status !== "completed" && (
                                <button
                                  title="Mark Completed"
                                  onClick={() => onMarkComplete(task._id)}
                                  className="p-1 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                >
                                  <CheckIcon size={14} weight="bold" />
                                </button>
                              )}

                              {!isExecuted && (
                                <button
                                  title="Edit"
                                  onClick={() => onEdit(task)}
                                  className="p-1 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                >
                                  <PencilSimpleIcon size={14} weight="bold" />
                                </button>
                              )}

                              <button
                                title="Delete"
                                onClick={() => onDelete(task._id)}
                                className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <TrashIcon size={14} weight="bold" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 xl:hidden bg-gray-900/30">
              {tasks.map((task: any) => {
                const start = splitDateTime(task.suggestedStartDateTime);
                const end = splitDateTime(task.suggestedEndDateTime);
                const isExecuted =
                  task.status === "completed" || !!task.aiOutput;

                return (
                  <div
                    key={task._id}
                    className="bg-[#1f2937]/40 hover:bg-[#1f2937]/70 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-white font-bold leading-snug">
                          {task.title}
                        </h4>
                        {task.isBlockingEvent && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 mt-1">
                            URGENT
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border whitespace-nowrap ${getStatusStyle(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2">
                      {task.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 bg-[#111827] p-3 rounded-xl border border-gray-800/60 mt-auto">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                          Start
                        </p>
                        {start.date !== "-" ? (
                          <>
                            <p className="text-sm text-gray-300 font-medium">
                              {start.date}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              {start.time}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">-</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                          End
                        </p>
                        {end.date !== "-" ? (
                          <>
                            <p className="text-sm text-gray-300 font-medium">
                              {end.date}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              {end.time}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">-</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
                      {task.aiActionType === "default" ? (
                        <div className="flex items-center justify-center gap-1.5 bg-gray-800/40 text-gray-400 border border-gray-700/50 px-4 py-2 rounded-xl text-sm font-bold cursor-default select-none w-full">
                          <CheckCircleIcon
                            size={16}
                            weight="fill"
                            className="text-emerald-500"
                          />{" "}
                          Planned
                        </div>
                      ) : isExecuted ? (
                        <button
                          onClick={() => onView(task)}
                          className="flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors w-full"
                        >
                          <EyeIcon size={16} weight="bold" /> View Output
                        </button>
                      ) : (
                        <button
                          onClick={() => onTryExecute(task)}
                          disabled={executingTaskId === task._id}
                          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 w-full"
                        >
                          {executingTaskId === task._id ? (
                            <SpinnerGapIcon
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <LightningIcon size={16} weight="fill" />
                          )}
                          {executingTaskId === task._id ? "Wait..." : "Execute"}
                        </button>
                      )}

                      <div className="flex items-center justify-center gap-2 mt-1">
                        {task.status !== "completed" && (
                          <button
                            onClick={() => onMarkComplete(task._id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold text-gray-500 hover:text-emerald-400 bg-gray-800/30 hover:bg-emerald-500/10 border border-gray-800/60 rounded-md transition-colors"
                          >
                            <CheckIcon size={12} weight="bold" /> Complete
                          </button>
                        )}

                        {!isExecuted && (
                          <button
                            onClick={() => onEdit(task)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold text-gray-500 hover:text-blue-400 bg-gray-800/30 hover:bg-blue-500/10 border border-gray-800/60 rounded-md transition-colors"
                          >
                            <PencilSimpleIcon size={12} weight="bold" /> Edit
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(task._id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold text-gray-500 hover:text-red-400 bg-gray-800/30 hover:bg-red-500/10 border border-gray-800/60 rounded-md transition-colors"
                        >
                          <TrashIcon size={12} weight="bold" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
