"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export default function AnalyticsPage() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.analytics.getDashboardSummary.queryOptions(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                  <span className="text-sm font-medium text-white">↓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Downloads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.totalDownloads.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                  <span className="text-sm font-medium text-white">📄</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.downloadsThisMonth.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
                  <span className="text-sm font-medium text-white">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Form Submissions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.totalFormSubmissions.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
                  <span className="text-sm font-medium text-white">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Pending Requests
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.pendingAccessRequests.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Documents */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900">
              Top Downloaded Documents
            </h3>
            <div className="space-y-3">
              {data.topDocuments.map(
                (doc: { title: string; downloads: number }, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {doc.title}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {doc.downloads}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Form Breakdown */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900">
              Form Submissions by Type
            </h3>
            <div className="space-y-3">
              {data.formBreakdown.map(
                (form: { type: string; count: number }, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {form.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {form.count}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {data.recentActivity.map(
              (
                activity: {
                  type: string;
                  title: string;
                  email: string | null;
                  createdAt: Date;
                },
                index: number,
              ) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                      <span className="text-xs font-medium text-gray-600">
                        {activity.type === "download" ? "↓" : "📝"}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {activity.email ?? "Anonymous"}
                      </span>{" "}
                      {activity.type === "download"
                        ? "downloaded"
                        : "submitted"}{" "}
                      <span className="font-medium">{activity.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
