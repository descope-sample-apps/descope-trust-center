"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

type FormType = "contact" | "document_request" | "subprocessor_subscription";
type FormStatus = "pending" | "approved" | "denied" | "completed";

export function FormAnalytics() {
  const trpc = useTRPC();
  const [typeFilter, setTypeFilter] = useState<FormType | undefined>();
  const [statusFilter, setStatusFilter] = useState<FormStatus | undefined>();
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data: formsData } = useSuspenseQuery(
    trpc.analytics.getFormStats.queryOptions({
      type: typeFilter,
      status: statusFilter,
      limit,
      offset,
    }),
  );

  const { submissions, total, hasMore } = formsData;

  const typeOptions: { value: FormType; label: string }[] = [
    { value: "contact", label: "Contact" },
    { value: "document_request", label: "Document Request" },
    { value: "subprocessor_subscription", label: "Subprocessor Subscription" },
  ];

  const statusOptions: { value: FormStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "denied", label: "Denied" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select
              value={typeFilter ?? ""}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value ? (e.target.value as FormType) : undefined,
                )
              }
              className="bg-background rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              value={statusFilter ?? ""}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value ? (e.target.value as FormStatus) : undefined,
                )
              }
              className="bg-background rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            Total Submissions
          </h4>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">Pending</h4>
          <p className="text-2xl font-bold">
            {submissions.filter((s) => s.status === "pending").length}
          </p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            Approved
          </h4>
          <p className="text-2xl font-bold">
            {submissions.filter((s) => s.status === "approved").length}
          </p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            Completed
          </h4>
          <p className="text-2xl font-bold">
            {submissions.filter((s) => s.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Form Submissions</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            All form submissions with status tracking
          </p>

          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Contact</th>
                    <th className="p-3 text-left font-medium">Company</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b">
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {submission.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">
                            {submission.name ?? "Anonymous"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {submission.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">
                          {submission.company ?? "Not specified"}
                        </p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${submission.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""} ${submission.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""} ${submission.status === "denied" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""} ${submission.status === "completed" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : ""} `}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {submissions.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">
                No submissions found
              </p>
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
                {total} submissions
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="rounded border px-3 py-1 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={!hasMore}
                  className="rounded border px-3 py-1 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
