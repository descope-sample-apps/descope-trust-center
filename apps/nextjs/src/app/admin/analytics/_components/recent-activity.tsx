"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

type ActivityItem = {
  id: string;
  type: "download" | "submission" | "request";
  title: string;
  description: string;
  timestamp: Date;
};

export function RecentActivity() {
  const trpc = useTRPC();

  const { data: downloads } = useQuery(
    trpc.analytics.getDownloadStats.queryOptions({ limit: 3 }),
  );

  const { data: submissions } = useQuery(
    trpc.analytics.getFormStats.queryOptions({ limit: 3 }),
  );

  const { data: requests } = useQuery(
    trpc.analytics.getAccessRequests.queryOptions({ limit: 3 }),
  );

  const activities: ActivityItem[] = [
    ...(downloads?.downloads.map((d) => ({
      id: d.id,
      type: "download" as const,
      title: d.documentTitle,
      description: d.userEmail ?? "Anonymous download",
      timestamp: new Date(d.createdAt),
    })) ?? []),
    ...(submissions?.submissions.map((s) => ({
      id: s.id,
      type: "submission" as const,
      title: `${s.type} form`,
      description: s.email,
      timestamp: new Date(s.createdAt),
    })) ?? []),
    ...(requests?.requests.map((r) => ({
      id: r.id,
      type: "request" as const,
      title: r.documentTitle,
      description: `Access request from ${r.email}`,
      timestamp: new Date(r.createdAt),
    })) ?? []),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-muted-foreground text-sm">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-md border p-3"
            >
              <div
                className={`mt-0.5 h-2 w-2 rounded-full ${
                  activity.type === "download"
                    ? "bg-green-500"
                    : activity.type === "submission"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{activity.title}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {activity.description}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
