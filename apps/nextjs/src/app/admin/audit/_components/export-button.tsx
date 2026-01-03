"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

type ExportFormat = "json" | "csv";

export function ExportButton() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await queryClient.fetchQuery(
        trpc.audit.export.queryOptions({ format, limit: 1000 }),
      );

      const mimeType = format === "csv" ? "text/csv" : "application/json";
      const extension = format === "csv" ? "csv" : "json";
      const filename = `audit-logs-${new Date().toISOString().split("T")[0]}.${extension}`;

      const blob = new Blob([result.data], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className="bg-background rounded-md border px-3 py-2 text-sm"
        value={format}
        onChange={(e) => setFormat(e.target.value as ExportFormat)}
        disabled={isExporting}
      >
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
      </select>
      <Button onClick={handleExport} disabled={isExporting} variant="outline">
        {isExporting ? "Exporting..." : "Export"}
      </Button>
    </div>
  );
}
