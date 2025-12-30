"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function TopDocuments() {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.analytics.getDownloadStats.queryOptions({ limit: 5 }),
  );

  const documentCounts = new Map<string, { title: string; count: number }>();
  data?.downloads.forEach((download) => {
    const existing = documentCounts.get(download.documentId);
    if (existing) {
      existing.count++;
    } else {
      documentCounts.set(download.documentId, {
        title: download.documentTitle,
        count: 1,
      });
    }
  });

  const topDocuments = Array.from(documentCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">Top Downloaded Documents</h3>
      {topDocuments.length === 0 ? (
        <p className="text-muted-foreground text-sm">No downloads yet</p>
      ) : (
        <div className="space-y-3">
          {topDocuments.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <span className="font-medium">{doc.title}</span>
              </div>
              <span className="text-muted-foreground text-sm">
                {doc.count} {doc.count === 1 ? "download" : "downloads"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
