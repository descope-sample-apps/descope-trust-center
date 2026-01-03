import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { DashboardStats } from "./_components/dashboard-stats";

export default function AdminDashboardPage() {
  // Prefetch all content counts
  prefetch(trpc.adminContent.getCertifications.queryOptions());
  prefetch(trpc.adminContent.getDocuments.queryOptions());
  prefetch(trpc.adminContent.getSubprocessors.queryOptions());
  prefetch(trpc.adminContent.getFAQs.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Overview of your trust center content and recent activity.
          </p>
        </div>

        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      </div>
    </HydrateClient>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border p-6">
          <div className="flex items-center">
            <div className="bg-muted h-4 w-4 animate-pulse rounded" />
            <div className="bg-muted ml-2 h-4 w-20 animate-pulse rounded" />
          </div>
          <div className="bg-muted mt-2 h-8 w-16 animate-pulse rounded" />
          <div className="bg-muted mt-1 h-3 w-24 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
