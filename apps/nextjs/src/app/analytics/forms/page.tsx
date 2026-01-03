"use client";

import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface FormSubmission {
  id: string;
  type: string;
  email: string;
  name: string | null;
  company: string | null;
  status: string;
  metadata: Record<string, unknown>;
  respondedAt: Date | null;
  respondedBy: string | null;
  responseNotes: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

type Status = "new" | "responded" | "closed";

type FilterValue = Status | "all";

export default function FormSubmissionsPage() {
  const trpc = useTRPC();
  const [typeFilter, setTypeFilter] = useState<FilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, refetch } = useSuspenseQuery(
    trpc.analytics.getFormStats.queryOptions({
      ...(typeFilter !== "all" && {
        type: typeFilter as
          | "contact"
          | "document_request"
          | "subprocessor_subscription",
      }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(searchTerm && { searchTerm }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    }),
  );

  const updateMutation = useMutation(
    trpc.analytics.updateFormSubmissionStatus.mutationOptions({
      onSuccess: () => refetch(),
    }),
  );

  const filteredSubmissions = data.submissions;

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
      acc[sub.type] = (acc[sub.type] ?? 0) + 1;
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
          <p className="text-3xl font-bold">{typeBreakdown.contact ?? 0}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Document Requests
          </h3>
          <p className="text-3xl font-bold">
            {typeBreakdown.document_request ?? 0}
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
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by email, name, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterValue)}
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
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredSubmissions.map((submission) => (
              <tr
                key={submission.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedSubmission(submission as FormSubmission);
                  setIsModalOpen(true);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getTypeLabel(submission.type)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.name ?? "Anonymous"}
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={submission.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Status;
                      if (
                        newStatus !== submission.status &&
                        (newStatus === "responded" || newStatus === "closed")
                      ) {
                        updateMutation.mutate({
                          id: submission.id,
                          status: newStatus,
                        });
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                  </select>
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

      {/* Modal for viewing submission details */}
      {isModalOpen && selectedSubmission && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">Form Submission Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getTypeLabel(selectedSubmission.type)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span className={getStatusBadge(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedSubmission.name ?? "Anonymous"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedSubmission.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedSubmission.company ?? "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Submitted
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedSubmission.respondedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Responded
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedSubmission.respondedAt).toLocaleString()}{" "}
                    by {selectedSubmission.respondedBy}
                  </p>
                  {selectedSubmission.responseNotes && (
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedSubmission.responseNotes}
                    </p>
                  )}
                </div>
              )}
              {(() => {
                const message = selectedSubmission.metadata.message;
                return (
                  typeof message === "string" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <div className="mt-1 max-h-40 overflow-y-auto rounded border p-3 text-sm text-gray-900">
                        {message}
                      </div>
                    </div>
                  )
                );
              })()}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
