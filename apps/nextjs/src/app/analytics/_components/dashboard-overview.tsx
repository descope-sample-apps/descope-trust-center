"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function DashboardOverview() {
  const trpc = useTRPC();

  // Get top downloaded documents
  const { data: downloads } = useSuspenseQuery(
    trpc.analytics.getDownloadStats.queryOptions({ limit: 5 }),
  );

  // Get recent form submissions
  const { data: forms } = useSuspenseQuery(
    trpc.analytics.getFormStats.queryOptions({ limit: 5 }),
  );

  return (
    <div className="space-y-6">
      {/* Top Downloaded Documents */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Top Downloaded Documents</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Most popular documents this month
          </p>
          <div className="mt-4 space-y-3">
            {downloads.downloads.slice(0, 5).map((download, index) => (
              <div
                key={download.id}
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
                      {download.userName ?? download.userEmail ?? "Anonymous"}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {new Date(download.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {downloads.downloads.length === 0 && (
              <p className="text-muted-foreground text-sm">No downloads yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Form Submissions */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Recent Form Submissions</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Latest contact and document requests
          </p>
          <div className="mt-4 space-y-3">
            {forms.submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${submission.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""} ${submission.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""} ${submission.status === "denied" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""} ${submission.status === "completed" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : ""} `}
                  >
                    {submission.type === "contact" ? "C" : "D"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {submission.name || submission.email}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {submission.type.replace("_", " ")} • {submission.status}
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {forms.submissions.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No submissions yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
