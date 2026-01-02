"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export default function AnalyticsDashboard() {
  const trpc = useTRPC();
  const [dateRange, setDateRange] = useState<string>("30d");

  const getDateRange = () => {
    const now = new Date();
    const endDate = now.toISOString();
    let startDate: string;

    switch (dateRange) {
      case "7d":
        startDate = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        break;
      case "30d":
        startDate = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
        break;
      case "90d":
        startDate = new Date(
          now.getTime() - 90 * 24 * 60 * 60 * 1000,
        ).toISOString();
        break;
      default:
        return undefined;
    }

    return { startDate, endDate };
  };

  const range = getDateRange();

  const { data: summary } = useSuspenseQuery(
    trpc.analytics.getDashboardSummary.queryOptions(range),
  );

  const { data: topDownloads } = useSuspenseQuery(
    trpc.analytics.getTopDownloadedDocuments.queryOptions({
      dateRange: range,
      limit: 5,
    }),
  );

  const { data: formStats } = useSuspenseQuery(
    trpc.analytics.getFormSubmissionsByType.queryOptions({
      dateRange: range,
    }),
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-32 rounded border p-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 text-lg font-semibold">Total Downloads</h3>
          <div className="text-3xl font-bold">{summary.totalDownloads}</div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="mb-2 text-lg font-semibold">Form Submissions</h3>
          <div className="text-3xl font-bold">
            {summary.totalFormSubmissions}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="mb-2 text-lg font-semibold">
            Pending Access Requests
          </h3>
          <div className="text-3xl font-bold">
            {summary.pendingAccessRequests}
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg border p-6">
        <h3 className="mb-4 text-xl font-semibold">
          Top 5 Downloaded Documents
        </h3>
        <div className="space-y-4">
          {topDownloads.map((doc, index) => (
            <div
              key={doc.documentId}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800">
                  {index + 1}
                </span>
                <div>
                  <div className="font-medium">{doc.documentTitle}</div>
                  <div className="text-sm text-gray-600">{doc.documentId}</div>
                </div>
              </div>
              <div className="text-lg font-semibold">{doc.downloadCount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-xl font-semibold">Form Submissions by Type</h3>
        <div className="space-y-4">
          {formStats.map((stat) => (
            <div key={stat.type} className="flex items-center justify-between">
              <div className="font-medium capitalize">
                {stat.type.replace("_", " ")}
              </div>
              <div className="text-lg font-semibold">{stat.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
