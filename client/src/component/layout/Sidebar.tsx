"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartPieSliceIcon, LayoutIcon, ListChecksIcon } from "@phosphor-icons/react";

const Sidebar = () => {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm";
    const isActive = pathname.startsWith(path);
    const activeClasses = "bg-indigo-600/10 text-indigo-300 font-semibold border border-indigo-500/20";
    const inactiveClasses = "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="w-64 h-screen fixed bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
      <h1 className="text-xl font-bold text-white mb-8 px-2">TaskFlow AI</h1>
      <nav className="space-y-2 flex-1">
        <Link href="/dashboard" className={getLinkClass("/dashboard")}><LayoutIcon weight="fill" /> Dashboard</Link>
        <Link href="/tasks" className={getLinkClass("/tasks")}><ListChecksIcon weight="fill" /> My Tasks</Link>
        <Link href="/insights" className={getLinkClass("/insights")}><ChartPieSliceIcon weight="fill" /> AI Insights</Link>
      </nav>
      <div className="text-xs text-gray-600 px-2">v1.0.0</div>
    </div>
  );
};
export default Sidebar;
