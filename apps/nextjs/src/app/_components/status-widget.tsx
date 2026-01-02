"use client";

import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

/**
 * Status indicator colors and icons based on status
 */
const STATUS_CONFIG = {
  Operational: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    icon: (
      <svg
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  "Planned Maintenance": {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  "Degraded Performance": {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-950",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
  },
  "Partial Outage": {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
  },
  "Major Outage": {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
} as const;

/**
 * Status Widget component for displaying real-time system status.
 * Shows current operational status and links to full status page.
 *
 * @remarks
 * This is a Client Component that fetches status data via tRPC.
 * Gracefully degrades to "Operational" status if API is unavailable.
 */
export function StatusWidget() {
  const trpc = useTRPC();

  // Fetch status data - will suspend until data is available
  const { data: statusData } = useSuspenseQuery(
    trpc.trustCenter.getStatusPage.queryOptions(),
  );

  // Handle both full API response and fallback operational status
  const overallStatus =
    "result" in statusData
      ? statusData.result.status_overall
      : statusData.status_overall;

  const incidents =
    "result" in statusData ? statusData.result.incidents : statusData.incidents;

  const maintenance =
    "result" in statusData
      ? statusData.result.maintenance
      : statusData.maintenance;

  const config =
    STATUS_CONFIG[overallStatus.status] || STATUS_CONFIG["Operational"];
  const hasActiveIncidents = incidents.length > 0;
  const hasActiveMaintenance = maintenance.active.length > 0;

  // Determine status page URL - fallback to a generic status page if not configured
  const statusPageUrl =
    process.env.NEXT_PUBLIC_STATUSPAGE_URL ||
    (process.env.NEXT_PUBLIC_STATUSPAGE_PAGE_ID
      ? `https://${process.env.NEXT_PUBLIC_STATUSPAGE_PAGE_ID}.statuspage.io`
      : "https://status.descope.com");

  return (
    <div className="flex items-center gap-3">
      {/* Status Badge */}
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${config.bgColor} ${config.borderColor} ${config.color}`}
        role="status"
        aria-label={`System status: ${overallStatus.status}`}
      >
        {config.icon}
        <span>{overallStatus.status}</span>
        {hasActiveIncidents && (
          <span
            className="ml-1 inline-flex h-2 w-2 rounded-full bg-red-500"
            aria-label="Active incident"
          />
        )}
        {hasActiveMaintenance && (
          <span
            className="ml-1 inline-flex h-2 w-2 rounded-full bg-blue-500"
            aria-label="Planned maintenance"
          />
        )}
      </div>

      {/* Link to Status Page */}
      <Link
        href={statusPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-slate-600 underline underline-offset-2 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label="View full status page (opens in new tab)"
      >
        View Status
      </Link>
    </div>
  );
}
