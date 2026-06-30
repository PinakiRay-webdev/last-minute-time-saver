"use client";

import React, { useCallback, useEffect, useState } from "react";
// Make sure this import path is correct for your project structure
import DashboardOverview from "./Dashboard";
import api from "../../../lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch function: Yeh data layega aur refreshData ke taur par bhi use hoga
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get("/api/dashboard/getinfo");
      if (res.data.status === "success") {
        setDashboardData(res.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
          error.response?.data?.message || "Failed to load dashboard data",
          { theme: "dark" }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Initial Load: Yeh sirf page load hone par ek baar chalega
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 3. Loading State
  if (loading && !dashboardData) {
    return (
        <div className="flex h-full min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-indigo-500"></div>
        </div>
    );
  }

  // 4. Error State
  if (!dashboardData) {
    return (
        <div className="flex h-full min-h-[60vh] items-center justify-center text-gray-400">
          <p>Failed to load data. Please refresh the page.</p>
        </div>
    );
  }

  // 5. Success Render
  return (
      <div className="h-full">
        <DashboardOverview
            data={dashboardData}
            // Yahan hum exactly wahi function pass kar rahe hain jo upar define kiya hai
            refreshData={fetchDashboardData}
        />
        <ToastContainer />
      </div>
  );
};

export default Page;