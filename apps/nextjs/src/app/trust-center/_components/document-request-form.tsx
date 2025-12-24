"use client";

import { useCallback, useState } from "react";

import { cn } from "@descope-trust-center/ui";
import { Button } from "@descope-trust-center/ui/button";
import { Input } from "@descope-trust-center/ui/input";
import { Label } from "@descope-trust-center/ui/label";

import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";

interface DocumentRequestFormProps {
  /** Document ID to request access to */
  documentId: string;
  /** Document title for display */
  documentTitle: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Modal form for requesting access to NDA-required documents.
 * Collects name, email, company, and reason for access.
 *
 * @remarks
 * Submits via tRPC mutation to `trustCenter.requestDocument`.
 * Includes proper focus management and keyboard handling for accessibility.
 */
export function DocumentRequestForm({
  documentId,
  documentTitle,
  isOpen,
  onClose,
}: DocumentRequestFormProps) {
  const trpc = useTRPC();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    reason: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const requestMutation = useMutation(
    trpc.trustCenter.requestDocument.mutationOptions({
      onSuccess: () => {
        setSubmitSuccess(true);
        setFormState({ name: "", email: "", company: "", reason: "" });
      },
    }),
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      requestMutation.mutate({
        documentId,
        ...formState,
      });
    },
    [documentId, formState, requestMutation],
  );

  const handleInputChange = useCallback(
    (field: keyof typeof formState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleClose = useCallback(() => {
    setSubmitSuccess(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className={cn(
            "absolute right-4 top-4 rounded-full p-1",
            "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            "dark:hover:bg-slate-800 dark:hover:text-slate-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300",
          )}
          aria-label="Close dialog"
        >
          <CloseIcon className="size-5" />
        </button>

        {submitSuccess ? (
          /* Success State */
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckIcon className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <h2
              id="request-form-title"
              className="text-xl font-semibold text-slate-900 dark:text-white"
            >
              Request Submitted
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Our security team will review your request and respond within 3
              business days.
            </p>
            <Button onClick={handleClose} className="mt-6 w-full">
              Close
            </Button>
          </div>
        ) : (
          /* Form */
          <>
            <h2
              id="request-form-title"
              className="text-xl font-semibold text-slate-900 dark:text-white"
            >
              Request Document Access
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Requesting access to:{" "}
              <span className="font-medium">{documentTitle}</span>
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="request-name">Name</Label>
                <Input
                  id="request-name"
                  type="text"
                  required
                  value={formState.name}
                  onChange={handleInputChange("name")}
                  placeholder="Your full name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="request-email">Email</Label>
                <Input
                  id="request-email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleInputChange("email")}
                  placeholder="you@company.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="request-company">Company</Label>
                <Input
                  id="request-company"
                  type="text"
                  required
                  value={formState.company}
                  onChange={handleInputChange("company")}
                  placeholder="Your company name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="request-reason">Reason for Access</Label>
                <textarea
                  id="request-reason"
                  required
                  minLength={10}
                  value={formState.reason}
                  onChange={handleInputChange("reason")}
                  placeholder="Please describe why you need access to this document..."
                  rows={3}
                  className={cn(
                    "mt-1.5 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm",
                    "placeholder:text-slate-400 dark:border-slate-700 dark:placeholder:text-slate-500",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300",
                    "resize-none",
                  )}
                />
              </div>

              {requestMutation.error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Failed to submit request. Please try again.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="flex-1"
                >
                  {requestMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Close icon (X) for modal close button.
 */
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

/**
 * Checkmark icon for success state.
 */
function CheckIcon({ className }: { className?: string }) {
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
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
