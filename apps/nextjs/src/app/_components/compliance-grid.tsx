"use client";

import type {
  Certification,
  CertificationStatus,
} from "@descope-trust-center/validators";
import { useState } from "react";

import { cn } from "@descope-trust-center/ui";
import { Button } from "@descope-trust-center/ui/button";

import certificationsData from "~/app/data/certifications.json";

type FilterStatus = "all" | CertificationStatus;

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "in-progress", label: "In Progress" },
  { value: "expired", label: "Expired" },
];

/**
 * Returns the appropriate badge styles based on certification status
 */
function getStatusBadgeStyles(status: CertificationStatus): string {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  switch (status) {
    case "active":
      return cn(
        baseStyles,
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      );
    case "in-progress":
      return cn(
        baseStyles,
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      );
    case "expired":
      return cn(
        baseStyles,
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      );
    case "pending-renewal":
      return cn(
        baseStyles,
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      );
    default:
      return cn(
        baseStyles,
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      );
  }
}

/**
 * Returns human-readable status label
 */
function getStatusLabel(status: CertificationStatus): string {
  const labels: Record<CertificationStatus, string> = {
    active: "Active",
    "in-progress": "In Progress",
    expired: "Expired",
    "pending-renewal": "Pending Renewal",
  };
  return labels[status] ?? status;
}

/**
 * Formats a date string for display
 */
function formatDate(dateString: string | undefined): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Checks if a date is within the next 90 days
 */
function isExpiringSoon(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const expiryDate = new Date(dateString);
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  return expiryDate <= ninetyDaysFromNow && expiryDate > now;
}

interface CertificationCardProps {
  certification: Certification;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Individual certification card component with expand/collapse functionality
 */
function CertificationCard({
  certification,
  isExpanded,
  onToggleExpand,
}: CertificationCardProps) {
  const lastAuditFormatted = formatDate(certification.lastAuditDate);
  const expiryFormatted = formatDate(certification.expiryDate);
  const expiringSoon = isExpiringSoon(certification.expiryDate);
  const hasDetails =
    lastAuditFormatted ??
    expiryFormatted ??
    (certification.standards && certification.standards.length > 0);

  return (
    <article
      className={cn(
        "group bg-card relative flex flex-col rounded-lg border p-6 shadow-sm transition-all",
        "focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2 hover:shadow-md",
        isExpanded && "ring-primary ring-2",
      )}
      aria-labelledby={`cert-name-${certification.id}`}
    >
      {/* Header: Logo placeholder + Name + Status */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo placeholder - uses first letter as fallback */}
          <div
            className="bg-muted text-muted-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-semibold"
            aria-hidden="true"
          >
            {certification.name.charAt(0).toUpperCase()}
          </div>
          <h3
            id={`cert-name-${certification.id}`}
            className="text-lg leading-tight font-semibold"
          >
            {certification.name}
          </h3>
        </div>
        <span
          className={getStatusBadgeStyles(certification.status)}
          role="status"
          aria-label={`Status: ${getStatusLabel(certification.status)}`}
        >
          {getStatusLabel(certification.status)}
        </span>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-4 flex-1 text-sm">
        {certification.description}
      </p>

      {/* Expandable details section */}
      {hasDetails && (
        <div
          id={`cert-details-${certification.id}`}
          className={cn(
            "overflow-hidden transition-all duration-200",
            isExpanded ? "mb-4 max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
          aria-hidden={!isExpanded}
        >
          <div className="space-y-2 border-t pt-4">
            {lastAuditFormatted && (
              <p className="text-sm">
                <span className="font-medium">Last Audited:</span>{" "}
                <span className="text-muted-foreground">
                  {lastAuditFormatted}
                </span>
              </p>
            )}
            {expiryFormatted && (
              <p className="text-sm">
                <span className="font-medium">Expires:</span>{" "}
                <span
                  className={cn(
                    "text-muted-foreground",
                    expiringSoon &&
                      "font-medium text-yellow-600 dark:text-yellow-400",
                  )}
                >
                  {expiryFormatted}
                  {expiringSoon && " (Expiring Soon)"}
                </span>
              </p>
            )}
            {certification.standards && certification.standards.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Standards:</span>{" "}
                <span className="text-muted-foreground">
                  {certification.standards.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {hasDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            aria-controls={`cert-details-${certification.id}`}
          >
            {isExpanded ? "Show Less" : "Show Details"}
          </Button>
        )}
        {certification.certificateUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a
              href={certification.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View Certificate for ${certification.name}`}
            >
              View Certificate
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </Button>
        ) : certification.status === "in-progress" ? (
          <Button variant="outline" size="sm">
            Request Access
          </Button>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Compliance Grid component displaying certification cards with filtering
 *
 * Features:
 * - Responsive grid layout (3 cols desktop, 2 tablet, 1 mobile)
 * - Status filtering (All, Active, In Progress, Expired)
 * - Expandable cards with audit dates, expiry, and standards
 * - Accessible with keyboard navigation and screen reader support
 */
export function ComplianceGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Cast JSON data to typed certifications
  const certifications = certificationsData as Certification[];

  // Filter certifications based on active filter
  const filteredCertifications =
    activeFilter === "all"
      ? certifications
      : certifications.filter((cert) => cert.status === activeFilter);

  // Sort by expiry date (soonest first), then by status
  const sortedCertifications = [...filteredCertifications].sort((a, b) => {
    // Expired first, then active with expiry, then others
    if (a.expiryDate && b.expiryDate) {
      return (
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
    }
    if (a.expiryDate) return -1;
    if (b.expiryDate) return 1;
    return 0;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section aria-labelledby="compliance-grid-heading">
      <h2 id="compliance-grid-heading" className="sr-only">
        Compliance Certifications
      </h2>

      {/* Filter buttons */}
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter certifications by status"
      >
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Certification grid */}
      {sortedCertifications.length > 0 ? (
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Certification cards"
        >
          {sortedCertifications.map((cert) => (
            <div key={cert.id} role="listitem">
              <CertificationCard
                certification={cert}
                isExpanded={expandedIds.has(cert.id)}
                onToggleExpand={() => toggleExpand(cert.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-lg border border-dashed p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-muted-foreground">No certifications found</p>
        </div>
      )}
    </section>
  );
}

export default ComplianceGrid;
