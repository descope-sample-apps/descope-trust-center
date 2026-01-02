"use client";

import { useState } from "react";
import { format } from "date-fns";

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

export default function AuditLogsPage() {
  const trpc = useTRPC();
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    resource: "",
    fromDate: "",
    toDate: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  const { data: auditData, isLoading } = trpc.analytics.getAuditLogs.useQuery({
    ...filters,
    limit: 50,
    offset: currentPage * 50,
  });

  const exportMutation = trpc.analytics.exportAuditLogs.useMutation();
  const cleanMutation = trpc.analytics.cleanAuditLogs.useMutation();

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        ...filters,
        format: exportFormat,
      });

      if (result.format === "csv") {
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
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
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleClean = async () => {
    if (
      !confirm(
        "Are you sure you want to clean old audit logs? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const result = await cleanMutation.mutateAsync({ daysOld: 90 });
      alert(
        `Cleaned ${result.deletedCount} audit logs older than ${result.cutoffDate}`,
      );
      window.location.reload();
    } catch (error) {
      console.error("Clean failed:", error);
    }
  };

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
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={filters.userId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userId: e.target.value }))
            }
            placeholder="Filter by user ID"
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
          <Label htmlFor="resource">Resource</Label>
          <Input
            id="resource"
            value={filters.resource}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, resource: e.target.value }))
            }
            placeholder="Filter by resource"
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
              <TableHead>User ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  Loading audit logs...
                </TableCell>
              </TableRow>
            ) : auditData?.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              auditData?.logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>{log.userId || "Anonymous"}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.resource || "-"}</TableCell>
                  <TableCell>
                    <pre className="max-w-xs overflow-hidden text-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </TableCell>
                  <TableCell>{log.ipAddress || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {auditData && auditData.hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={isLoading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
