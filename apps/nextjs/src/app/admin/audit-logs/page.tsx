"use client";

import { useState } from "react";
import { format } from "date-fns";

import type { RouterOutputs } from "@descope-trust-center/api";
import { Button } from "@descope-trust-center/ui/button";
import { Input } from "@descope-trust-center/ui/input";
import { Label } from "@descope-trust-center/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@descope-trust-center/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@descope-trust-center/ui/table";

import { useTRPC } from "~/trpc/react";

type AuditLog = RouterOutputs["analytics"]["getAuditLogs"]["logs"][0];

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function AuditLogsPage() {
  const trpc = useTRPC();
  const [filters, setFilters] = useState({
    userEmail: "",
    action: "",
    entityType: "",
    fromDate: "",
    toDate: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  const { data: auditData } = (trpc as any).analytics.getAuditLogs.useQuery({
    ...filters,
    limit: 50,
    offset: currentPage * 50,
  });

  const exportMutation = (trpc as any).analytics.exportAuditLogs.useMutation();
  const cleanMutation = (trpc as any).analytics.cleanAuditLogs.useMutation();

  // Type assertions needed due to tRPC client typing issues with admin procedures
  const handleExportAsync = async () => {
    const result = (await exportMutation.mutateAsync({
      ...filters,
      format: exportFormat,
    })) as { format: string; data: string; filename?: string };

    if (result.format === "csv") {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        result.filename ||
        `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCleanAsync = async () => {
    if (
      !confirm(
        "Are you sure you want to clean old audit logs? This action cannot be undone.",
      )
    ) {
      return;
    }

    const result = (await cleanMutation.mutateAsync({ daysOld: 90 })) as {
      deletedCount: number;
      cutoffDate: string;
    };
    alert(
      `Cleaned ${result.deletedCount} audit logs older than ${result.cutoffDate}`,
    );
    window.location.reload();
  };

  const handleExport = handleExportAsync;
  const handleClean = handleCleanAsync;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleClean}
            variant="destructive"
            disabled={cleanMutation.isPending}
          >
            {cleanMutation.isPending ? "Cleaning..." : "Clean Old Logs"}
          </Button>
          <Select
            value={exportFormat}
            onValueChange={(value: "csv" | "json") => setExportFormat(value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <Label htmlFor="userEmail">User Email</Label>
          <Input
            id="userEmail"
            value={filters.userEmail}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userEmail: e.target.value }))
            }
            placeholder="Filter by user email"
          />
        </div>
        <div>
          <Label htmlFor="action">Action</Label>
          <Input
            id="action"
            value={filters.action}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, action: e.target.value }))
            }
            placeholder="Filter by action"
          />
        </div>
        <div>
          <Label htmlFor="entityType">Entity Type</Label>
          <Input
            id="entityType"
            value={filters.entityType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, entityType: e.target.value }))
            }
            placeholder="Filter by entity type"
          />
        </div>
        <div>
          <Label htmlFor="fromDate">From Date</Label>
          <Input
            id="fromDate"
            type="datetime-local"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="toDate">To Date</Label>
          <Input
            id="toDate"
            type="datetime-local"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, toDate: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditData.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              auditData.logs.map((log: AuditLog) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>{log.userEmail ?? "Anonymous"}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.entityType
                      ? `${log.entityType}${log.entityId ? ` (${log.entityId})` : ""}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <pre className="max-w-xs overflow-hidden text-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </TableCell>
                  <TableCell>{log.ipAddress ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {auditData.hasMore && (
        <div className="mt-6 flex justify-center">
          <Button onClick={() => setCurrentPage((prev) => prev + 1)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
