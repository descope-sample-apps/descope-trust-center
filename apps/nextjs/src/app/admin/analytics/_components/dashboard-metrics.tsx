"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function DashboardMetrics() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.analytics.getDashboardSummary.queryOptions());

  const metrics = [
    {
      label: "Total Downloads",
      value: data?.totalDownloads ?? 0,
      icon: DownloadIcon,
      description: "Document downloads all time",
    },
    {
      label: "Form Submissions",
      value: data?.totalFormSubmissions ?? 0,
      icon: FileTextIcon,
      description: "Contact and access requests",
    },
    {
      label: "Pending Requests",
      value: data?.pendingAccessRequests ?? 0,
      icon: ClockIcon,
      description: "Awaiting approval",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-card rounded-lg border p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              {metric.label}
            </span>
            <metric.icon className="text-muted-foreground h-5 w-5" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold">{metric.value}</span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {metric.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
