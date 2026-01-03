"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function AuditStats() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.audit.getStats.queryOptions({ days: 30 }));

  const stats = [
    {
      label: "Downloads",
      value: data?.downloads ?? 0,
      color: "text-green-600",
    },
    { label: "Views", value: data?.views ?? 0, color: "text-blue-600" },
    { label: "Creates", value: data?.creates ?? 0, color: "text-purple-600" },
    { label: "Updates", value: data?.updates ?? 0, color: "text-orange-600" },
    {
      label: "Approvals",
      value: data?.approvals ?? 0,
      color: "text-emerald-600",
    },
    { label: "Denials", value: data?.denials ?? 0, color: "text-red-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-lg border p-4">
          <span className="text-muted-foreground text-sm">{stat.label}</span>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
