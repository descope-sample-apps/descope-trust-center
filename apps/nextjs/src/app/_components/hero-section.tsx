import { Suspense } from "react";
import Link from "next/link";

import type { Certification } from "@descope-trust-center/validators";
import { cn } from "@descope-trust-center/ui";
import { buttonVariants } from "@descope-trust-center/ui/button";

import certificationsData from "~/app/data/certifications.json";
import { StatusWidget } from "./status-widget";

/** Key trust badges to display (filter for active/featured certifications) */
const FEATURED_CERTIFICATION_IDS = ["soc2-type2", "iso27001", "gdpr", "hipaa"];

/** Stats displayed in the hero section */
const TRUST_STATS = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "Zero", label: "Data Breaches" },
  { value: "24/7", label: "Security Monitoring" },
] as const;

/**
 * Hero Section for the Trust Center landing page.
 * Displays headline, trust badges, key stats, and CTA.
 *
 * @remarks
 * This is a Server Component - no client-side JavaScript required.
 * Certifications are loaded from static JSON at build time.
 */
export function HeroSection() {
  const certifications = certificationsData as Certification[];

  const featuredCertifications = certifications.filter((cert) =>
    FEATURED_CERTIFICATION_IDS.includes(cert.id),
  );

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 px-4 py-20 sm:px-6 md:py-32 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-200/30 blur-3xl dark:from-violet-900/20 dark:to-purple-900/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-200/30 to-violet-200/30 blur-3xl dark:from-purple-900/20 dark:to-violet-900/20" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Trust badge and status */}
        <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-sm dark:border-violet-800 dark:bg-slate-900/80 dark:text-violet-300">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            SOC 2 Type II Certified
          </div>

          <Suspense
            fallback={
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                Loading status...
              </div>
            }
          >
            <StatusWidget />
          </Suspense>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="bg-gradient-to-r from-slate-900 via-violet-800 to-slate-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl dark:from-white dark:via-violet-300 dark:to-white"
        >
          Security & Compliance at Descope
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
          Your trust is our foundation. We maintain rigorous security standards
          and compliance certifications to ensure your data is always protected.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#certifications"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary hover:bg-primary/90 text-base shadow-lg shadow-violet-500/25",
            )}
          >
            View Our Certifications
          </Link>
          <Link
            href="#documents"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "text-base",
            )}
          >
            Browse Security Docs
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12">
          <p className="mb-4 text-sm font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Trusted Certifications
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {featuredCertifications.map((cert) => (
              <CertificationBadge key={cert.id} certification={cert} />
            ))}
          </div>
        </div>

        {/* Key Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-violet-100 bg-white/60 p-6 backdrop-blur-sm dark:border-violet-900/50 dark:bg-slate-900/60"
            >
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-violet-400 dark:to-purple-400">
                {stat.value}
              </span>
              <span className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Individual certification badge component.
 * Shows certification name with status indicator.
 */
function CertificationBadge({
  certification,
}: {
  certification: Certification;
}) {
  const isActive = certification.status === "active";
  const isInProgress = certification.status === "in-progress";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
        isActive &&
          "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
        isInProgress &&
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
      )}
    >
      {/* Status indicator dot */}
      <span
        className={cn(
          "size-2 rounded-full",
          isActive && "bg-green-500",
          isInProgress && "bg-amber-500",
        )}
        aria-hidden="true"
      />
      <span>{certification.name}</span>
      {isInProgress && (
        <span className="text-xs opacity-75">(In Progress)</span>
      )}
    </div>
  );
}
