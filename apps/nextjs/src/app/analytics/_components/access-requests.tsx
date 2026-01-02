"use client";

import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

type RequestStatus = "pending" | "approved" | "denied";

export function AccessRequests() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>();
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<"approve" | "deny" | null>(
    null,
  );
  const [denyReason, setDenyReason] = useState("");

  const { data: requestsData } = useSuspenseQuery(
    trpc.analytics.getAccessRequests.queryOptions({
      status: statusFilter,
      limit,
      offset,
    }),
  );

  const { requests, total, hasMore } = requestsData;

  const approveMutation = useMutation(
    trpc.analytics.approveAccess.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.analytics.pathFilter());
        setSelectedRequest(null);
        setActionModal(null);
      },
    }),
  );

  const denyMutation = useMutation(
    trpc.analytics.denyAccess.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.analytics.pathFilter());
        setSelectedRequest(null);
        setActionModal(null);
        setDenyReason("");
      },
    }),
  );

  const handleApprove = (requestId: string) => {
    setSelectedRequest(requestId);
    setActionModal("approve");
  };

  const handleDeny = (requestId: string) => {
    setSelectedRequest(requestId);
    setActionModal("deny");
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate({ requestId: selectedRequest });
    }
  };

  const confirmDeny = () => {
    if (selectedRequest && denyReason.trim()) {
      denyMutation.mutate({
        requestId: selectedRequest,
        reason: denyReason.trim(),
      });
    }
  };

  const statusOptions: { value: RequestStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "denied", label: "Denied" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              value={statusFilter || ""}
              onChange={(e) =>
                setStatusFilter((e.target.value as RequestStatus) ?? undefined)
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            Total Requests
          </h4>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">Pending</h4>
          <p className="text-2xl font-bold">
            {requests.filter((r) => r.status === "pending").length}
          </p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h4 className="text-muted-foreground text-sm font-medium">
            Approved
          </h4>
          <p className="text-2xl font-bold">
            {requests.filter((r) => r.status === "approved").length}
          </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium">Access Requests</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            NDA document access requests requiring approval
          </p>

          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Document</th>
                    <th className="p-3 text-left font-medium">Requester</th>
                    <th className="p-3 text-left font-medium">Company</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Requested</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{request.documentTitle}</p>
                          <p className="text-muted-foreground text-xs">
                            ID: {request.documentId}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {request.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{request.company}</p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${request.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""} ${request.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""} ${request.status === "denied" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""} `}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-3">
                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeny(request.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Deny
                            </Button>
                          </div>
                        )}
                        {request.status === "approved" &&
                          request.approvedAt && (
                            <p className="text-muted-foreground text-xs">
                              Approved{" "}
                              {new Date(
                                request.approvedAt,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        {request.status === "denied" && request.deniedAt && (
                          <p className="text-muted-foreground text-xs">
                            Denied{" "}
                            {new Date(request.deniedAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {requests.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">
                No access requests found
              </p>
            )}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
                {total} requests
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

      {/* Approve Modal */}
      {actionModal === "approve" && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-medium">Approve Access Request</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              This will grant access to the NDA-protected document and send a
              confirmation email to the requester.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {actionModal === "deny" && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-medium">Deny Access Request</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Reason for denial
              </label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Please provide a reason for denying this request..."
                className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={confirmDeny}
                disabled={denyMutation.isPending || !denyReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {denyMutation.isPending ? "Denying..." : "Deny"}
              </Button>
              <Button variant="outline" onClick={() => setActionModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
