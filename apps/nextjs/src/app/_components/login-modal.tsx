"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@descope-trust-center/ui";

import { Descope, DESCOPE_FLOW_ID } from "~/auth/client";

/**
 * Login modal component that displays the Descope authentication flow.
 * Used for auth-gated document downloads and general sign-in.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback when modal should close
 * @param onSuccess - Optional callback after successful authentication
 */
export function LoginModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();

  const handleSuccess = useCallback(() => {
    router.refresh();
    onSuccess?.();
    onClose();
  }, [router, onSuccess, onClose]);

  const handleError = useCallback((error: unknown) => {
    console.error("Auth error:", error);
  }, []);

  // Close on escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Enter" && onClose()}
        aria-label="Close modal"
        tabIndex={-1}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl",
          "dark:border dark:border-slate-700 dark:bg-slate-900",
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 rounded-full p-1",
            "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
            "focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none",
          )}
          aria-label="Close login modal"
        >
          <CloseIcon className="size-5" />
        </button>

        {/* Title */}
        <h2
          id="login-modal-title"
          className="mb-6 text-center text-xl font-semibold text-slate-900 dark:text-white"
        >
          Sign in to continue
        </h2>

        {/* Descope Flow */}
        <Descope
          flowId={DESCOPE_FLOW_ID}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
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
