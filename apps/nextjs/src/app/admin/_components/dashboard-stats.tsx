"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: string;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-muted-foreground ml-2 text-sm font-medium">
          {title}
        </h3>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const trpc = useTRPC();

  const { data: certifications } = useQuery(
    trpc.adminContent.getCertifications.queryOptions(),
  );

  const { data: documents } = useQuery(
    trpc.adminContent.getDocuments.queryOptions(),
  );

  const { data: subprocessors } = useQuery(
    trpc.adminContent.getSubprocessors.queryOptions(),
  );

  const { data: faqs } = useQuery(trpc.adminContent.getFAQs.queryOptions());

  const stats = [
    {
      title: "Certifications",
      value: certifications?.length ?? 0,
      description: "Active certifications",
      icon: "🏆",
    },
    {
      title: "Documents",
      value: documents?.length ?? 0,
      description: "Published documents",
      icon: "📄",
    },
    {
      title: "Subprocessors",
      value: subprocessors?.length ?? 0,
      description: "Active subprocessors",
      icon: "🏢",
    },
    {
      title: "FAQs",
      value: faqs?.length ?? 0,
      description: "Published questions",
      icon: "❓",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
