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

interface TopDownload {
  documentTitle: string;
  count: number;
}

interface FormSummaryItem {
  type: string;
  count: number;
}

interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  user: string | null;
  email: string | null;
  company: string | null;
  createdAt: Date;
}

interface DashboardOverviewProps {
  onTabChange?: (tab: string) => void;
}

export function DashboardOverview({ onTabChange }: DashboardOverviewProps) {
  const trpc = useTRPC();
  const [dateRange, setDateRange] = useState("30");

  // Get top downloaded documents
  const { data: topDownloads } = useSuspenseQuery(
    trpc.analytics.getTopDownloads.queryOptions(),
  );

  // Get form summary for chart
  const { data: formSummary } = useSuspenseQuery(
    trpc.analytics.getFormSummary.queryOptions(),
  );

  // Get recent activity timeline
  const { data: recentActivity } = useSuspenseQuery(
    trpc.analytics.getRecentActivity.queryOptions(),
  );

  const chartData = (formSummary as FormSummaryItem[]).map((item) => ({
    type: item.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Top Downloaded Documents */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Top Downloaded Documents</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Most popular documents by download count
          </p>
          <div className="mt-4 space-y-3">
            {(topDownloads as TopDownload[]).map((download, index) => (
              <div
                key={download.documentTitle}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {download.documentTitle}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {download.count} downloads
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium">{download.count}</span>
              </div>
            ))}
            {topDownloads.length === 0 && (
              <p className="text-muted-foreground text-sm">No downloads yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Submission Summary Chart */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Form Submissions by Type</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Breakdown of form submissions by category
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Latest downloads and form submissions
          </p>
          <div className="mt-4 space-y-3">
            {(recentActivity as RecentActivityItem[]).map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-center space-x-3"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    activity.type === "download"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {activity.type === "download" ? "↓" : "📝"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {activity.user ?? activity.email ?? "Anonymous"}
                    {activity.company && ` • ${activity.company}`}
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Quick Access</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Jump to specific analytics sections
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <button
              onClick={() => onTabChange?.("downloads")}
              className="flex flex-col items-center rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg
                className="mb-2 h-8 w-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">Downloads</span>
            </button>
            <button
              onClick={() => onTabChange?.("forms")}
              className="flex flex-col items-center rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg
                className="mb-2 h-8 w-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">Forms</span>
            </button>
            <button
              onClick={() => onTabChange?.("requests")}
              className="flex flex-col items-center rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg
                className="mb-2 h-8 w-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-sm font-medium">Access Requests</span>
            </button>
            <button
              onClick={() => onTabChange?.("engagement")}
              className="flex flex-col items-center rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <svg
                className="mb-2 h-8 w-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm font-medium">Engagement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
