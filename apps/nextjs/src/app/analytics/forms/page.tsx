"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

type Status = "new" | "responded" | "closed";

type SortField = "type" | "email" | "createdAt" | "status" | "respondedAt";
type SortDirection = "asc" | "desc";

export default function FormSubmissionsPage() {
  const trpc = useTRPC();
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data } = useSuspenseQuery(
    trpc.analytics.getFormStats.queryOptions({
      type:
        typeFilter === "all"
          ? undefined
          : (typeFilter as
              | "contact"
              | "document_request"
              | "subprocessor_subscription"),
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  );

  const filteredSubmissions = data.submissions
    .filter((submission) => {
      const matchesSearch =
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (submission.company?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (submission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);

      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "respondedAt") {
        aValue = a.respondedAt ? new Date(a.respondedAt).getTime() : 0;
        bValue = b.respondedAt ? new Date(b.respondedAt).getTime() : 0;
      } else if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "responded":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "closed":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "new":
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "contact":
        return "Contact";
      case "document_request":
        return "Document Request";
      case "subprocessor_subscription":
        return "Subprocessor Subscription";
      default:
        return type;
    }
  };

  const totalSubmissions = data.total;
  const typeBreakdown = data.submissions.reduce(
    (acc, sub) => {
      acc[sub.type] = (acc[sub.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Total Submissions
          </h3>
          <p className="text-3xl font-bold">{totalSubmissions}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Contact Forms
          </h3>
          <p className="text-3xl font-bold">{typeBreakdown.contact || 0}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Document Requests
          </h3>
          <p className="text-3xl font-bold">
            {typeBreakdown.document_request || 0}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            New Submissions
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.submissions.filter((s) => s.status === "new").length}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Form Submissions</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by email, name, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="contact">Contact</option>
            <option value="document_request">Document Request</option>
            <option value="subprocessor_subscription">
              Subprocessor Subscription
            </option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Response Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredSubmissions.map((submission) => (
              <tr
                key={submission.id}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getTypeLabel(submission.type)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.name || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.email}
                  </div>
                  {submission.company && (
                    <div className="text-sm text-gray-500">
                      {submission.company}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(submission.status)}>
                    {submission.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {submission.respondedAt
                    ? new Date(submission.respondedAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No form submissions found.
        </div>
      )}
    </div>
  );
}
