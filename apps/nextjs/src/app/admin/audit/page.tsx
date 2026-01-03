import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { AuditLogTable } from "./_components/audit-log-table";
import { AuditStats } from "./_components/audit-stats";
import { CleanButton } from "./_components/clean-button";
import { ExportButton } from "./_components/export-button";

export default function AuditLogPage() {
  prefetch(trpc.audit.list.queryOptions({ limit: 50 }));
  prefetch(trpc.audit.getStats.queryOptions({ days: 30 }));
  prefetch(trpc.audit.getEntityTypes.queryOptions());

  return (
    <HydrateClient>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
            <p className="text-muted-foreground mt-2">
              Track all system events for compliance and security monitoring.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Suspense fallback={<ExportButtonSkeleton />}>
              <ExportButton />
            </Suspense>
            <CleanButton />
          </div>
        </div>

        <Suspense fallback={<StatsSkeleton />}>
          <AuditStats />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <AuditLogTable />
        </Suspense>
      </div>
    </HydrateClient>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card animate-pulse rounded-lg border p-4">
          <div className="bg-muted h-4 w-16 rounded" />
          <div className="bg-muted mt-2 h-6 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b p-4">
        <div className="flex gap-4">
          <div className="bg-muted h-10 w-48 animate-pulse rounded" />
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
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

function ExportButtonSkeleton() {
  return <div className="bg-muted h-10 w-24 animate-pulse rounded" />;
}

function _CleanButtonSkeleton() {
  return <div className="bg-muted h-10 w-32 animate-pulse rounded" />;
}
