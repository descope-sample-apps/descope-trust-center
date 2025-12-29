"use client";

import { useTRPC } from "~/trpc/react";

export default function AnalyticsPage() {
  const { analytics } = useTRPC();

  const { data: summary, isLoading } = analytics.getDashboardSummary.useQuery();
  const { data: downloads } = analytics.getDownloadStats.useQuery({
    limit: 10,
  });
  const { data: forms } = analytics.getFormStats.useQuery({ limit: 10 });
  const { data: requests } = analytics.getAccessRequests.useQuery({
    limit: 10,
  });

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Total Downloads
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {summary?.totalDownloads ?? 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Form Submissions
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {summary?.totalFormSubmissions ?? 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Access Requests
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {summary?.totalAccessRequests ?? 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">
            Pending Requests
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {summary?.pendingAccessRequests ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Top Documents</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Document</th>
              <th className="py-2 text-right">Downloads</th>
            </tr>
          </thead>
          <tbody>
            {summary?.topDocuments.map((doc) => (
              <tr key={doc.documentId} className="border-b last:border-0">
                <td className="py-2">{doc.documentTitle}</td>
                <td className="py-2 text-right">{doc.downloads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Downloads</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Document</th>
              <th className="py-2 text-left">User</th>
              <th className="py-2 text-left">Company</th>
              <th className="py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {downloads?.downloads.map((download) => (
              <tr key={download.id} className="border-b last:border-0">
                <td className="py-2">{download.documentTitle}</td>
                <td className="py-2">
                  {download.userName ?? download.userEmail ?? "Anonymous"}
                </td>
                <td className="py-2">{download.company ?? "-"}</td>
                <td className="py-2">
                  {new Date(download.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Form Submissions</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Type</th>
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Company</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {forms?.submissions.map((form) => (
              <tr key={form.id} className="border-b last:border-0">
                <td className="py-2">{form.type}</td>
                <td className="py-2">{form.name}</td>
                <td className="py-2">{form.email}</td>
                <td className="py-2">{form.company ?? "-"}</td>
                <td className="py-2">{form.status}</td>
                <td className="py-2">
                  {new Date(form.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Access Requests</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Document</th>
              <th className="py-2 text-left">Requestor</th>
              <th className="py-2 text-left">Company</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {requests?.requests.map((request) => (
              <tr key={request.id} className="border-b last:border-0">
                <td className="py-2">{request.documentTitle}</td>
                <td className="py-2">{request.name}</td>
                <td className="py-2">{request.company ?? "-"}</td>
                <td className="py-2">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "denied"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="py-2">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
