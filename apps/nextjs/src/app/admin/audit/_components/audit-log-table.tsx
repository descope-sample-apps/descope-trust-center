"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@descope-trust-center/ui";
import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "download"
  | "approve"
  | "deny"
  | "login"
  | "logout";

const actionColors: Record<AuditAction, string> = {
  create:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  update:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  view: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  download: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  approve:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  deny: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
  login: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  logout: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function AuditLogTable() {
  const trpc = useTRPC();
  const [action, setAction] = useState<AuditAction | undefined>();
  const [entityType, setEntityType] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: entityTypes } = useQuery(
    trpc.audit.getEntityTypes.queryOptions(),
  );

  const { data, isLoading } = useQuery(
    trpc.audit.list.queryOptions({
      action,
      entityType,
      limit: pageSize,
      offset: page * pageSize,
    }),
  );

  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b p-4">
        <div className="flex flex-wrap gap-4">
          <select
            className="bg-background rounded-md border px-3 py-2 text-sm"
            value={action ?? ""}
            onChange={(e) => {
              setAction(
                (e.target.value || undefined) as AuditAction | undefined,
              );
              setPage(0);
            }}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="download">Download</option>
            <option value="approve">Approve</option>
            <option value="deny">Deny</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>

          <select
            className="bg-background rounded-md border px-3 py-2 text-sm"
            value={entityType ?? ""}
            onChange={(e) => {
              setEntityType(e.target.value || undefined);
              setPage(0);
            }}
          >
            <option value="">All Entity Types</option>
            {entityTypes?.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 text-left text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">IP Address</th>
              <th className="px-4 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : data?.logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  No audit logs found
                </td>
              </tr>
            ) : (
              data?.logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                        actionColors[log.action as AuditAction],
                      )}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-muted-foreground ml-2 text-sm">
                          #{log.entityId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">
                        {log.userName ?? "Anonymous"}
                      </div>
                      {log.userEmail && (
                        <div className="text-muted-foreground text-sm">
                          {log.userEmail}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {log.ipAddress ?? "-"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t p-4">
        <span className="text-muted-foreground text-sm">
          Showing {page * pageSize + 1}-
          {Math.min((page + 1) * pageSize, data?.total ?? 0)} of{" "}
          {data?.total ?? 0}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.hasMore}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
