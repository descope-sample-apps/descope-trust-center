"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  Document,
  DocumentAccessLevel,
  DocumentCategory,
} from "@descope-trust-center/validators";
import { cn } from "@descope-trust-center/ui";
import { Button, buttonVariants } from "@descope-trust-center/ui/button";
import { Input } from "@descope-trust-center/ui/input";

import documentsData from "~/app/data/documents.json";
import { useSession } from "~/auth/client";
import { DocumentRequestForm } from "./document-request-form";
import { LoginModal } from "./login-modal";

/** Category configuration with labels */
const CATEGORIES: { id: DocumentCategory | "all"; label: string }[] = [
  { id: "all", label: "All Documents" },
  { id: "security-policy", label: "Security Policies" },
  { id: "compliance", label: "Compliance" },
  { id: "legal", label: "Legal" },
  { id: "questionnaire", label: "Questionnaires" },
  { id: "audit-report", label: "Audit Reports" },
  { id: "technical", label: "Technical" },
];

/** Category badge color mapping */
const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  "security-policy":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  compliance:
    "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  legal:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  questionnaire:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "audit-report":
    "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  technical:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

/** Access level badge styling */
const ACCESS_LEVEL_CONFIG: Record<
  DocumentAccessLevel,
  { label: string; className: string }
> = {
  public: {
    label: "Public",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
  "login-required": {
    label: "Login Required",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  "nda-required": {
    label: "NDA Required",
    className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
};

/**
 * Document Library section for the Trust Center.
 * Displays downloadable security documents with category filtering, search,
 * and access level handling (public, login-required, NDA-required).
 *
 * @remarks
 * This is a Client Component due to interactivity (filtering, search, modal).
 * Documents are loaded from static JSON data.
 */
export function DocumentLibrary() {
  const { isAuthenticated } = useSession();
  const documents = documentsData as Document[];
  const [activeCategory, setActiveCategory] = useState<
    DocumentCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestModalDocument, setRequestModalDocument] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  /** Filter documents by category and search query */
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((doc) => doc.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags?.some((tag: string) => tag.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [documents, activeCategory, searchQuery]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const openRequestModal = useCallback((doc: Document) => {
    setRequestModalDocument({ id: doc.id, title: doc.title });
  }, []);

  const closeRequestModal = useCallback(() => {
    setRequestModalDocument(null);
  }, []);

  return (
    <section
      aria-labelledby="documents-heading"
      className="bg-slate-50 px-4 py-16 sm:px-6 md:py-24 lg:px-8 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center">
          <h2
            id="documents-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Document Library
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Access security policies, compliance reports, questionnaires, and
            legal documents.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8">
          <div className="relative mx-auto max-w-md">
            <SearchIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search documents"
              className="pr-10 pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className={cn(
                  "absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5",
                  "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                  "focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none",
                )}
                aria-label="Clear search"
              >
                <CloseIcon className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="-mx-4 mt-8 px-4 sm:mx-0 sm:px-0">
          <div className="scrollbar-hide overflow-x-auto">
            <nav
              aria-label="Document categories"
              className="flex gap-2 pb-2 sm:flex-wrap sm:justify-center sm:pb-0"
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                    "min-h-[44px]",
                    "focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-slate-300",
                    activeCategory === category.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                  )}
                  aria-pressed={activeCategory === category.id}
                >
                  {category.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {filteredDocuments.length === 0
            ? "No documents found"
            : `${filteredDocuments.length} document${filteredDocuments.length === 1 ? "" : "s"} found`}
        </div>

        {/* Document Grid */}
        <div className="mt-8">
          {filteredDocuments.length === 0 ? (
            <div className="py-12 text-center">
              <FileIcon className="mx-auto size-12 text-slate-300 dark:text-slate-600" />
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                No documents found matching your search.
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isAuthenticated={isAuthenticated}
                  onRequestAccess={openRequestModal}
                  onLoginRequired={() => setShowLoginModal(true)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NDA Request Modal */}
      {requestModalDocument && (
        <DocumentRequestForm
          documentId={requestModalDocument.id}
          documentTitle={requestModalDocument.title}
          isOpen={!!requestModalDocument}
          onClose={closeRequestModal}
        />
      )}

      {/* Login Modal for restricted documents */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
}

/**
 * Individual document card component.
 * Displays document metadata and appropriate action button based on access level.
 */
function DocumentCard({
  document,
  isAuthenticated,
  onRequestAccess,
  onLoginRequired,
}: {
  document: Document;
  isAuthenticated: boolean;
  onRequestAccess: (doc: Document) => void;
  onLoginRequired: () => void;
}) {
  const accessConfig = ACCESS_LEVEL_CONFIG[document.accessLevel];
  const categoryColor = CATEGORY_COLORS[document.category];

  const formattedDate = useMemo(() => {
    try {
      return new Date(document.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return document.updatedAt;
    }
  }, [document.updatedAt]);

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border bg-white p-5 shadow-sm transition-shadow",
        "hover:shadow-md dark:border-slate-700 dark:bg-slate-900",
      )}
    >
      {/* Header with icon and badges */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <FileIcon className="size-5 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {document.title}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {/* Category badge */}
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                categoryColor,
              )}
            >
              {formatCategoryLabel(document.category)}
            </span>
            {/* Access level badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                accessConfig.className,
              )}
            >
              {document.accessLevel !== "public" && (
                <LockIcon className="size-3" />
              )}
              {accessConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-300">
        {document.description}
      </p>

      {/* Metadata */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        {document.fileSize && (
          <span className="flex items-center gap-1">
            <DownloadIcon className="size-3.5" />
            {document.fileSize}
          </span>
        )}
        <span className="flex items-center gap-1">
          <CalendarIcon className="size-3.5" />
          Updated {formattedDate}
        </span>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <DocumentActionButton
          document={document}
          isAuthenticated={isAuthenticated}
          onRequestAccess={onRequestAccess}
          onLoginRequired={onLoginRequired}
        />
      </div>
    </article>
  );
}

/**
 * Action button that changes based on document access level and auth state:
 * - public: Direct download (no auth required)
 * - login-required + authenticated: Direct download
 * - login-required + unauthenticated: Shows login button
 * - nda-required: Request access (opens modal)
 */
function DocumentActionButton({
  document,
  isAuthenticated,
  onRequestAccess,
  onLoginRequired,
}: {
  document: Document;
  isAuthenticated: boolean;
  onRequestAccess: (doc: Document) => void;
  onLoginRequired: () => void;
}) {
  switch (document.accessLevel) {
    case "public":
      if (document.fileUrl) {
        return (
          <a
            href={document.fileUrl}
            download
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-full",
            )}
          >
            <DownloadIcon className="size-4" />
            Download
          </a>
        );
      }
      return (
        <Button variant="outline" size="sm" disabled className="w-full">
          Not Available
        </Button>
      );

    case "login-required":
      if (!document.fileUrl) {
        return (
          <Button variant="outline" size="sm" disabled className="w-full">
            Not Available
          </Button>
        );
      }
      if (isAuthenticated) {
        return (
          <a
            href={document.fileUrl}
            download
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-full",
            )}
          >
            <DownloadIcon className="size-4" />
            Download
          </a>
        );
      }
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={onLoginRequired}
          className="w-full"
        >
          <LockIcon className="size-4" />
          Sign in to Download
        </Button>
      );

    case "nda-required":
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequestAccess(document)}
          className="w-full"
        >
          <LockIcon className="size-4" />
          Request Access
        </Button>
      );

    default:
      return null;
  }
}

/**
 * Format category ID to human-readable label
 */
function formatCategoryLabel(category: DocumentCategory): string {
  const categoryConfig = CATEGORIES.find((c) => c.id === category);
  return categoryConfig?.label ?? category;
}

// ==================== Icons ====================

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
