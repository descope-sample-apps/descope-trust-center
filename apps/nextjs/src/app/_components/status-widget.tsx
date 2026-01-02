"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { env } from "~/env";

interface StatusResponse {
  result: {
    status_overall: {
      status: string;
      status_code: number;
    };
    incidents: unknown[];
    maintenance: {
      active: unknown[];
      upcoming: unknown[];
    };
  };
}

const STATUS_BG_COLORS: Record<number, string> = {
  100: "bg-green-500", // Operational
  200: "bg-blue-500", // Planned Maintenance
  300: "bg-yellow-500", // Degraded
  400: "bg-orange-500", // Partial Outage
  500: "bg-red-500", // Major Outage
  600: "bg-purple-500", // Security
};

const STATUS_LABELS: Record<number, string> = {
  100: "Operational",
  200: "Planned Maintenance",
  300: "Degraded Performance",
  400: "Partial Service Disruption",
  500: "Service Disruption",
  600: "Security Event",
};

/**
 * Status Widget component that displays real-time system health from Status.io.
 * Shows overall status with color indicator and link to full status page.
 *
 * @remarks
 * Fetches status data on mount and displays gracefully on error.
 * Only renders if STATUS_PAGE_ID is configured.
 */
export function StatusWidget() {
  const [status, setStatus] = useState<
    StatusResponse["result"]["status_overall"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pageId = env.NEXT_PUBLIC_STATUS_PAGE_ID;

  useEffect(() => {
    if (!pageId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `https://api.status.io/1.0/status/${pageId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch status");
        const data = (await response.json()) as StatusResponse;
        setStatus(data.result.status_overall);
      } catch (err) {
        console.error("Failed to fetch status:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchStatus();
  }, [pageId]);

  // Don't render if no page ID configured
  if (!pageId) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-300 dark:bg-slate-600" />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Loading status...
        </span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-500" />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Status unavailable
        </span>
      </div>
    );
  }

  const statusCode = status.status_code;
  const bgColorClass = STATUS_BG_COLORS[statusCode] ?? STATUS_BG_COLORS[100];
  const label = STATUS_LABELS[statusCode] ?? status.status;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-4 dark:bg-slate-800">
      <div className={`h-3 w-3 rounded-full ${bgColorClass}`} />
      <span className="text-sm font-medium text-slate-900 dark:text-white">
        System Status: {label}
      </span>
      <Link
        href={`https://${pageId}.status.io`}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto text-sm text-slate-600 underline hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        View Details
      </Link>
    </div>
  );
}
