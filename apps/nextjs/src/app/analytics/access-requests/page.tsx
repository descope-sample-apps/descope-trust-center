"use client";

import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";
import { Input } from "@descope-trust-center/ui/input";
import { toast } from "@descope-trust-center/ui/toast";

import { useTRPC } from "~/trpc/react";

type Status = "pending" | "approved" | "denied";

export default function AccessRequestsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data } = useSuspenseQuery(
    trpc.analytics.getAccessRequests.queryOptions({
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  );

  const approveMutation = useMutation(
    trpc.analytics.approveAccess.mutationOptions({
      onSuccess: () => {
        toast.success("Request approved successfully.");
        queryClient.invalidateQueries(trpc.analytics.pathFilter());
      },
      onError: (error) => {
        toast.error("Failed to approve the request. Please try again.");
        console.error("Approve error:", error);
      },
    }),
  );

  const denyMutation = useMutation(
    trpc.analytics.denyAccess.mutationOptions({
      onSuccess: () => {
        toast.success("Request denied.");
        queryClient.invalidateQueries(trpc.analytics.pathFilter());
      },
      onError: (error) => {
        toast.error("Failed to deny the request. Please try again.");
        console.error("Deny error:", error);
      },
    }),
  );

  const handleApprove = (requestId: string) => {
    approveMutation.mutate({ requestId });
  };

  const handleDeny = (requestId: string) => {
    const reason = prompt("Please provide a reason for denying this request:");
    if (!reason || reason.trim().length < 10) {
      toast.error("Please provide a detailed reason (minimum 10 characters).");
      return;
    }
    denyMutation.mutate({ requestId, reason });
  };

  const filteredRequests = data.requests.filter((request) => {
    const matchesSearch =
      request.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.documentTitle.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "denied":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Document Access Requests</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search by company, email, or document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.documentTitle}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.name}
                  </div>
                  <div className="text-sm text-gray-500">{request.email}</div>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {request.company}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(request.status)}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  {request.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={
                          approveMutation.isPending || denyMutation.isPending
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeny(request.id)}
                        disabled={
                          approveMutation.isPending || denyMutation.isPending
                        }
                      >
                        Deny
                      </Button>
                    </div>
                  )}
                  {request.status === "approved" && request.approvedBy && (
                    <div className="text-sm text-gray-500">
                      Approved by {request.approvedBy}
                    </div>
                  )}
                  {request.status === "denied" && request.deniedBy && (
                    <div className="text-sm text-gray-500">
                      Denied by {request.deniedBy}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No access requests found.
        </div>
      )}
    </div>
  );
}
