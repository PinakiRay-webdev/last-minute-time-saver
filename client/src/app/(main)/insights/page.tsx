"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Insights from "./Insights";

export default function InsightsPage() {
  const [insights, setInsights] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedInsights = localStorage.getItem("ai_productivity_insights");

    if (storedInsights) {
      setInsights(storedInsights);
    }

    setLoading(false);
  }, []);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/task/insights");

      if (res.data.status === "success") {
        const newInsights = res.data.data;

        setInsights(newInsights);

        localStorage.setItem("ai_productivity_insights", newInsights);

        toast.success("Insights generated successfully! 🚀", { theme: "dark" });
      }
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      toast.error(
        error.response?.data?.message || "Failed to load your insights",
        { theme: "dark" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full relative">
      <Insights
        insights={insights}
        loading={loading}
        onGenerate={generateInsights}
      />
      <ToastContainer />
    </div>
  );
}
