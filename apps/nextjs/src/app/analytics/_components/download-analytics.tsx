"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function DownloadAnalytics() {
  const trpc = useTRPC();
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data: downloadsData } = useSuspenseQuery(
    trpc.analytics.getDownloadStats.queryOptions({ limit, offset }),
  );

  const { downloads, total, hasMore } = downloadsData;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            Total Downloads
          </h4>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            This Session
          </h4>
          <p className="text-2xl font-bold">{downloads.length}</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            Unique Documents
          </h4>
          <p className="text-2xl font-bold">
            {new Set(downloads.map((d) => d.documentId)).size}
          </p>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Download History</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Detailed view of all document downloads
          </p>

          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Document</th>
                    <th className="p-3 text-left font-medium">User</th>
                    <th className="p-3 text-left font-medium">Company</th>
                    <th className="p-3 text-left font-medium">Downloaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((download) => (
                    <tr key={download.id} className="border-b">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">
                            {download.documentTitle}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            ID: {download.documentId}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">
                            {download.userName ?? "Anonymous"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {download.userEmail ?? "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">
                          {download.company ?? "Not specified"}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">
                          {new Date(download.createdAt).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {downloads.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">
                No downloads found
              </p>
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
                {total} downloads
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="rounded border px-3 py-1 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={!hasMore}
                  className="rounded border px-3 py-1 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
