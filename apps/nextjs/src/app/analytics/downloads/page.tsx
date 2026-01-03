"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";
import { Input } from "@descope-trust-center/ui/input";

import { useTRPC } from "~/trpc/react";

type AccessLevel = "public" | "login-required" | "nda-required";
type Category = "security-policy" | "audit-report" | "legal" | "questionnaire";

export default function DownloadsAnalyticsPage() {
  const trpc = useTRPC();
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [accessFilter, setAccessFilter] = useState<AccessLevel | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("totalDownloads");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const { data } = useSuspenseQuery(
    trpc.analytics.getDocumentDownloadAnalytics.queryOptions(),
  );

  const { data: historyData } = useSuspenseQuery(
    trpc.analytics.getDownloadHistory.queryOptions(
      { documentId: selectedDocument ?? "" },
      { enabled: Boolean(selectedDocument) },
    ),
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedAndFilteredData = data
    .filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesAccess =
        accessFilter === "all" || item.accessLevel === accessFilter;
      const matchesSearch = item.documentTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesAccess && matchesSearch;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const exportToCSV = () => {
    const headers = [
      "Document Name",
      "Category",
      "Access Type",
      "Total Downloads",
      "Downloads This Month",
      "Downloads This Week",
      "Last Download Date",
      "Last Download User",
      "Last Download Company",
    ];
    const csvContent = [
      headers.join(","),
      ...sortedAndFilteredData.map((item) =>
        [
          `"${item.documentTitle}"`,
          item.category,
          item.accessLevel,
          item.totalDownloads,
          item.downloadsThisMonth,
          item.downloadsThisWeek,
          item.lastDownloadAt
            ? new Date(item.lastDownloadAt).toLocaleDateString()
            : "",
          item.lastDownloadUser ? `"${item.lastDownloadUser}"` : "",
          item.lastDownloadCompany ? `"${item.lastDownloadCompany}"` : "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document-downloads-analytics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAccessBadge = (access: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (access) {
      case "public":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "login-required":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "nda-required":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getCategoryBadge = (_category: string) => {
    return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Document Downloads Analytics</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80"
        />
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as Category | "all")
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="security-policy">Security Policy</option>
          <option value="audit-report">Audit Report</option>
          <option value="legal">Legal</option>
          <option value="questionnaire">Questionnaire</option>
        </select>
        <select
          value={accessFilter}
          onChange={(e) =>
            setAccessFilter(e.target.value as AccessLevel | "all")
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All Access Types</option>
          <option value="public">Public</option>
          <option value="login-required">Login Required</option>
          <option value="nda-required">NDA Required</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                onClick={() => handleSort("documentTitle")}
              >
                Document Name{" "}
                {sortField === "documentTitle" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                onClick={() => handleSort("totalDownloads")}
              >
                Total Downloads{" "}
                {sortField === "totalDownloads" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                onClick={() => handleSort("downloadsThisMonth")}
              >
                This Month{" "}
                {sortField === "downloadsThisMonth" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                onClick={() => handleSort("downloadsThisWeek")}
              >
                This Week{" "}
                {sortField === "downloadsThisWeek" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Last Download
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Access Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedAndFilteredData.map((item) => (
              <tr
                key={item.documentId}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedDocument(item.documentId)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.documentTitle}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className={getCategoryBadge(item.category)}>
                      {item.category.replace("-", " ")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {item.totalDownloads}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {item.downloadsThisMonth}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {item.downloadsThisWeek}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {item.lastDownloadAt ? (
                    <div>
                      {new Date(item.lastDownloadAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {item.lastDownloadUser && item.lastDownloadCompany
                          ? `${item.lastDownloadUser} (${item.lastDownloadCompany})`
                          : (item.lastDownloadUser ??
                            item.lastDownloadCompany ??
                            "Unknown")}
                      </div>
                    </div>
                  ) : (
                    "Never"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getAccessBadge(item.accessLevel)}>
                    {item.accessLevel.replace("-", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredData.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No downloads found matching the filters.
        </div>
      )}

      {selectedDocument && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[80vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Download History</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyData?.map((download) => (
                  <tr key={download.id}>
                    <td className="px-4 py-2 text-sm">
                      {new Date(download.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {download.userName || download.userEmail || "Anonymous"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {download.company || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {download.ipAddress || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
