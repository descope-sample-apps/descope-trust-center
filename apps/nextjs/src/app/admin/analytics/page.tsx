import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { DashboardMetrics } from "./_components/dashboard-metrics";
import { RecentActivity } from "./_components/recent-activity";
import { TopDocuments } from "./_components/top-documents";

export default async function AnalyticsDashboardPage() {
  prefetch(trpc.analytics.getDashboardSummary.queryOptions());
  prefetch(trpc.analytics.getDownloadStats.queryOptions({ limit: 5 }));
  prefetch(trpc.analytics.getFormStats.queryOptions({ limit: 5 }));
  prefetch(
    trpc.analytics.getAccessRequests.queryOptions({
      limit: 5,
      status: "pending",
    }),
  );

  return (
    <HydrateClient>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Analytics Overview
          </h2>
          <p className="text-muted-foreground mt-2">
            Monitor Trust Center engagement and manage access requests.
          </p>
        </div>

        <Suspense fallback={<MetricsSkeleton />}>
          <DashboardMetrics />
        </Suspense>

        <div className="grid gap-8 lg:grid-cols-2">
          <Suspense
            fallback={<CardSkeleton title="Top Downloaded Documents" />}
          >
            <TopDocuments />
          </Suspense>

          <Suspense fallback={<CardSkeleton title="Recent Activity" />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card animate-pulse rounded-lg border p-6">
          <div className="bg-muted h-4 w-24 rounded" />
          <div className="bg-muted mt-2 h-8 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-muted h-12 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
