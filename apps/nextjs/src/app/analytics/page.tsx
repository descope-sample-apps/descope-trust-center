"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export default function AnalyticsOverview() {
  const trpc = useTRPC();

  const { data: summary } = useSuspenseQuery(
    trpc.analytics.getDashboardSummary.queryOptions(),
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-lg border p-6">
        <h3 className="text-muted-foreground text-sm font-medium">
          Total Downloads
        </h3>
        <p className="text-3xl font-bold">{summary.totalDownloads}</p>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-muted-foreground text-sm font-medium">
          Form Submissions
        </h3>
        <p className="text-3xl font-bold">{summary.totalFormSubmissions}</p>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-muted-foreground text-sm font-medium">
          Pending Access Requests
        </h3>
        <p className="text-3xl font-bold text-orange-600">
          {summary.pendingAccessRequests}
        </p>
      </div>
    </div>
  );
}
