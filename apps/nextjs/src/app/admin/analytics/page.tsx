"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTRPC } from "~/trpc/react";

/**
 * Analytics Dashboard Overview Page
 * Displays key metrics and charts for internal teams
 */
export default function AnalyticsDashboardPage() {
  const trpc = useTRPC();

  // Date range state - default to last 30 days
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  });

  // Queries
  const summary = useSuspenseQuery(
    trpc.analytics.getDashboardSummary.queryOptions({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
  );

  const topDocuments = useSuspenseQuery(
    trpc.analytics.getTopDownloadedDocuments.queryOptions({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
  );

  const formStats = useSuspenseQuery(
    trpc.analytics.getFormSubmissionsByType.queryOptions({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
  );

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: new Date(value).toISOString(),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Overview of trust center engagement and document access metrics
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8 flex gap-4">
        <div>
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={dateRange.startDate.split("T")[0]}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={dateRange.endDate.split("T")[0]}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Downloads
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {summary.data.totalDownloads.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Form Submissions
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {summary.data.totalFormSubmissions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pending Requests
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {summary.data.pendingAccessRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Downloaded Documents */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Top 5 Downloaded Documents
          </h3>
          <div className="space-y-3">
            {topDocuments.data.map((doc, index) => (
              <div
                key={doc.documentTitle}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                    {index + 1}
                  </span>
                  <span className="max-w-xs truncate text-sm text-slate-700 dark:text-slate-300">
                    {doc.documentTitle}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {doc.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Submissions by Type */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Form Submissions by Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formStats.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
