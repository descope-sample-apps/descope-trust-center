"use client";

import { useMemo, useState } from "react";

import type {
  Subprocessor,
  SubprocessorStatus,
} from "@descope-trust-center/validators";
import { cn } from "@descope-trust-center/ui";
import { Input } from "@descope-trust-center/ui/input";

import subprocessorsData from "~/app/data/subprocessors.json";

/**
 * Status filter options for subprocessor filtering
 */
const STATUS_FILTERS = ["all", "active", "inactive", "under-review"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/**
 * Display labels for status values
 */
const STATUS_LABELS: Record<SubprocessorStatus | "all", string> = {
  all: "All",
  active: "Active",
  inactive: "Inactive",
  "under-review": "Under Review",
};

/**
 * Status badge styling based on status type
 */
function getStatusBadgeClasses(status: SubprocessorStatus): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
    case "under-review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
  }
}

/**
 * Individual subprocessor card for mobile view
 */
function SubprocessorCard({ subprocessor }: { subprocessor: Subprocessor }) {
  return (
    <article className="border-border bg-card rounded-lg border p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-card-foreground font-semibold">
          {subprocessor.name}
        </h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            getStatusBadgeClasses(subprocessor.status),
          )}
        >
          {STATUS_LABELS[subprocessor.status]}
        </span>
      </div>

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground font-medium">Purpose</dt>
          <dd className="text-card-foreground">{subprocessor.purpose}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground font-medium">Data Processed</dt>
          <dd className="text-card-foreground">
            {subprocessor.dataProcessed.join(", ")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground font-medium">Location</dt>
          <dd className="text-card-foreground">{subprocessor.location}</dd>
        </div>
        {subprocessor.contractUrl && (
          <div>
            <dt className="sr-only">Contract</dt>
            <dd>
              <a
                href={subprocessor.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary focus-visible:ring-ring inline-flex items-center gap-1 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                View DPA
                <span className="sr-only">
                  for {subprocessor.name} (opens in new tab)
                </span>
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}

/**
 * SubprocessorsList component displays a searchable and filterable list
 * of third-party data processors.
 *
 * Features:
 * - Search by name, purpose, data processed, or location
 * - Filter by status (active, inactive, under-review)
 * - Responsive: table on desktop, cards on mobile
 * - Accessible with keyboard navigation and screen reader support
 */
export function SubprocessorsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const subprocessors = subprocessorsData as Subprocessor[];

  const filteredSubprocessors = useMemo(() => {
    return subprocessors.filter((sp) => {
      // Status filter
      if (statusFilter !== "all" && sp.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          sp.name,
          sp.purpose,
          sp.location,
          ...sp.dataProcessed,
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [subprocessors, searchQuery, statusFilter]);

  const resultsCount = filteredSubprocessors.length;
  const totalCount = subprocessors.length;

  return (
    <section aria-labelledby="subprocessors-heading" className="py-12 md:py-16">
      <div className="container">
        {/* Section Header */}
        <div className="mb-8 max-w-3xl">
          <h2
            id="subprocessors-heading"
            className="text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl"
          >
            Our Subprocessors
          </h2>
          <p className="text-muted-foreground text-lg">
            We work with trusted third-party service providers to deliver our
            platform. These subprocessors may process customer data on our
            behalf. We carefully vet each provider to ensure they meet our
            security and privacy standards.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="subprocessor-search" className="sr-only">
              Search vendors
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                aria-hidden="true"
                className="text-muted-foreground size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Input
              id="subprocessor-search"
              type="search"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="pl-9"
            />
          </div>

          {/* Status Filter Buttons */}
          <div
            role="group"
            aria-label="Filter by status"
            className="flex flex-wrap gap-2"
          >
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={cn(
                  "focus-visible:ring-ring rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-muted-foreground mb-4 text-sm" aria-live="polite">
          {searchQuery || statusFilter !== "all"
            ? `${resultsCount} vendor${resultsCount !== 1 ? "s" : ""} found`
            : `${totalCount} vendor${totalCount !== 1 ? "s" : ""}`}
        </p>

        {/* Content */}
        {filteredSubprocessors.length === 0 ? (
          <div
            role="status"
            className="border-border bg-muted/50 rounded-lg border py-12 text-center"
          >
            <p className="text-muted-foreground">
              No vendors found matching your search
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="border-border hidden overflow-hidden rounded-lg border md:block">
              <table className="w-full">
                <caption className="sr-only">
                  List of subprocessors authorized to process customer data
                </caption>
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="text-foreground px-4 py-3 text-left text-sm font-semibold"
                    >
                      Vendor Name
                    </th>
                    <th
                      scope="col"
                      className="text-foreground px-4 py-3 text-left text-sm font-semibold"
                    >
                      Purpose
                    </th>
                    <th
                      scope="col"
                      className="text-foreground px-4 py-3 text-left text-sm font-semibold"
                    >
                      Data Processed
                    </th>
                    <th
                      scope="col"
                      className="text-foreground px-4 py-3 text-left text-sm font-semibold"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="text-foreground px-4 py-3 text-left text-sm font-semibold"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="text-foreground px-4 py-3 text-left text-sm font-semibold"
                    >
                      Contract
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border bg-card divide-y">
                  {filteredSubprocessors.map((sp) => (
                    <tr key={sp.id} className="hover:bg-muted/30">
                      <td className="text-card-foreground px-4 py-3 text-sm font-medium">
                        {sp.name}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {sp.purpose}
                      </td>
                      <td className="text-muted-foreground max-w-xs px-4 py-3 text-sm">
                        {sp.dataProcessed.join(", ")}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {sp.location}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            getStatusBadgeClasses(sp.status),
                          )}
                        >
                          {STATUS_LABELS[sp.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {sp.contractUrl ? (
                          <a
                            href={sp.contractUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary focus-visible:ring-ring inline-flex items-center gap-1 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          >
                            View DPA
                            <span className="sr-only">
                              for {sp.name} (opens in new tab)
                            </span>
                            <svg
                              aria-hidden="true"
                              className="size-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {filteredSubprocessors.map((sp) => (
                <SubprocessorCard key={sp.id} subprocessor={sp} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
