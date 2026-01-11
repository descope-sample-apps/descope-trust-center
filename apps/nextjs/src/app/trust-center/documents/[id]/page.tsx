"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import type { Document } from "@descope-trust-center/validators";
import { cn } from "@descope-trust-center/ui";
import { Button, buttonVariants } from "@descope-trust-center/ui/button";

import documentsData from "~/app/data/documents.json";
import { useSession } from "~/auth/client";
import { useTRPC } from "~/trpc/react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDownloadPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();

  const documents = documentsData as Document[];
  const document = documents.find((doc) => doc.id === id);

  if (!document) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <DocumentIcon className="size-16 text-slate-300 dark:text-slate-600" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          Document Not Found
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          The document you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/#documents"
          className={cn(buttonVariants({ variant: "default" }), "mt-6")}
        >
          Back to Document Library
        </Link>
      </div>
    );
  }

  if (document.accessLevel === "public") {
    return (
      <PublicDocumentView document={document} onBack={() => router.back()} />
    );
  }

  if (document.accessLevel === "login-required") {
    if (isSessionLoading) {
      return <LoadingState />;
    }
    if (!isAuthenticated) {
      return (
        <LoginRequiredView document={document} onBack={() => router.back()} />
      );
    }
    return (
      <PublicDocumentView document={document} onBack={() => router.back()} />
    );
  }

  if (isSessionLoading) {
    return <LoadingState />;
  }
  if (!isAuthenticated) {
    return (
      <LoginRequiredView document={document} onBack={() => router.back()} />
    );
  }
  return (
    <Suspense fallback={<LoadingState />}>
      <NdaDocumentView document={document} onBack={() => router.back()} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
    </div>
  );
}

function PublicDocumentView({
  document,
  onBack,
}: {
  document: Document;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </button>

      <div className="rounded-lg border bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckIcon className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {document.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {document.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          {document.fileSize && <span>Size: {document.fileSize}</span>}
          <span>Updated: {document.updatedAt}</span>
        </div>

        {document.fileUrl ? (
          <a
            href={document.fileUrl}
            download
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-8 w-full",
            )}
          >
            <DownloadIcon className="size-5" />
            Download Document
          </a>
        ) : (
          <p className="mt-8 text-center text-slate-500">
            Download link not available. Please contact support.
          </p>
        )}
      </div>
    </div>
  );
}

function LoginRequiredView({
  document,
  onBack,
}: {
  document: Document;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </button>

      <div className="rounded-lg border bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <LockIcon className="size-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {document.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {document.description}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-amber-800 dark:text-amber-200">
            This document requires authentication to download. Please sign in to
            access it.
          </p>
        </div>

        <Button size="lg" className="mt-6 w-full" asChild>
          <Link href="/api/auth/signin?callbackUrl=/trust-center/documents/">
            Sign In to Download
          </Link>
        </Button>
      </div>
    </div>
  );
}

function NdaDocumentView({
  document,
  onBack,
}: {
  document: Document;
  onBack: () => void;
}) {
  const trpc = useTRPC();
  const { data: accessData } = useSuspenseQuery(
    trpc.analytics.checkDocumentAccess.queryOptions({
      documentId: document.id,
    }),
  );

  if (!accessData.hasAccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </button>

        <div className="rounded-lg border bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <LockIcon className="size-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {document.title}
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                {document.description}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-red-800 dark:text-red-200">
              This document requires NDA approval. Your access request is either
              pending or has not been submitted yet.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" variant="outline" asChild>
              <Link href="/#documents">Request Access</Link>
            </Button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Go to the document library to submit an access request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </button>

      <div className="rounded-lg border bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckIcon className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {document.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {document.description}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-green-800 dark:text-green-200">
            Your access to this document has been approved.
            {accessData.request?.approvedAt && (
              <span className="block text-sm text-green-600 dark:text-green-400">
                Approved on{" "}
                {new Date(accessData.request.approvedAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          {document.fileSize && <span>Size: {document.fileSize}</span>}
          <span>Updated: {document.updatedAt}</span>
        </div>

        {document.fileUrl ? (
          <a
            href={document.fileUrl}
            download
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-8 w-full",
            )}
          >
            <DownloadIcon className="size-5" />
            Download Document
          </a>
        ) : (
          <p className="mt-8 text-center text-slate-500">
            The download link will be provided by our team. Please check your
            email.
          </p>
        )}
      </div>
    </div>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
