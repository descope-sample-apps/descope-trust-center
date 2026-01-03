import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { SubprocessorsTable } from "./_components/subprocessors-table";

export default function SubprocessorsAdminPage() {
  prefetch(trpc.adminContent.getSubprocessors.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Subprocessors</h2>
            <p className="text-muted-foreground mt-2">
              Manage third-party subprocessors and data processing agreements.
            </p>
          </div>
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <SubprocessorsTable />
        </Suspense>
      </div>
    </HydrateClient>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b p-4">
        <div className="flex gap-4">
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
          <div className="bg-muted h-10 w-24 animate-pulse rounded" />
        </div>
      </div>
      <div className="p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-muted mb-2 h-12 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
