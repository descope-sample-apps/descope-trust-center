"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { cn } from "@descope-trust-center/ui";

import { useTRPC } from "~/trpc/react";
import { AccessRequests } from "./access-requests";
import { DashboardOverview } from "./dashboard-overview";
import { DownloadAnalytics } from "./download-analytics";
import { FormAnalytics } from "./form-analytics";

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const trpc = useTRPC();

  const { data: summary } = useSuspenseQuery(
    trpc.analytics.getDashboardSummary.queryOptions(),
  );

  const tabs = [
    { id: "overview", label: "Overview", count: null },
    { id: "downloads", label: "Downloads", count: null },
    { id: "forms", label: "Forms", count: null },
    {
      id: "requests",
      label: "Access Requests",
      count: summary.pendingAccessRequests,
    },
    { id: "engagement", label: "Engagement", count: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">Total Downloads</h3>
            <svg
              className="text-muted-foreground h-4 w-4"
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
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{summary.totalDownloads}</div>
            <p className="text-muted-foreground text-xs">
              All time document downloads
            </p>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">Form Submissions</h3>
            <svg
              className="text-muted-foreground h-4 w-4"
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
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">
              {summary.totalFormSubmissions}
            </div>
            <p className="text-muted-foreground text-xs">
              Total form submissions received
            </p>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">Pending Requests</h3>
            <svg
              className="text-muted-foreground h-4 w-4"
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
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">
              {summary.pendingAccessRequests}
            </div>
            <p className="text-muted-foreground text-xs">
              NDA access requests awaiting approval
            </p>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-sm font-medium">Active Users</h3>
            <svg
              className="text-muted-foreground h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">-</div>
            <p className="text-muted-foreground text-xs">
              Unique users this month
            </p>
          </div>
        </div>
      </div>

      {/* Main analytics tabs */}
      <div className="space-y-4">
        <div className="border-b">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
                )}
              >
                {tab.label}
                {tab.count ? (
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <DashboardOverview onTabChange={setActiveTab} />
          )}
          {activeTab === "downloads" && <DownloadAnalytics />}
          {activeTab === "forms" && <FormAnalytics />}
          {activeTab === "requests" && <AccessRequests />}
          {activeTab === "engagement" && (
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium">
                  User Engagement Analytics
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Monitor user behavior and engagement patterns
                </p>
                <p className="text-muted-foreground mt-4">
                  User engagement tracking features will be implemented here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
