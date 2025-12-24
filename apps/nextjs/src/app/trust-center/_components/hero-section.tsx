import Link from "next/link";

import type { Certification } from "@acme/validators/trust-center";

import { cn } from "@descope-trust-center/ui";
import { buttonVariants } from "@descope-trust-center/ui/button";

import certificationsData from "~/app/data/certifications.json";

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
      className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 dark:from-slate-950 dark:to-slate-900 sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
        >
          Security & Compliance at Descope
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
          Your trust is our foundation. We maintain rigorous security standards
          and compliance certifications to ensure your data is always
          protected.
        </p>

        {/* CTA Button */}
        <div className="mt-8">
          <Link
            href="#certifications"
            className={cn(buttonVariants({ size: "lg" }), "text-base")}
          >
            View Our Certifications
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
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
