import { Suspense } from "react";

import { ComplianceGrid } from "./_components/compliance-grid";
import { ContactForm } from "./_components/contact-form";
import { DocumentLibrary } from "./_components/document-library";
import { FAQSection } from "./_components/faq-section";
import { HeroSection } from "./_components/hero-section";
import { SecurityOverview } from "./_components/security-overview";
import { SubprocessorsList } from "./_components/subprocessors-list";
import { SubprocessorSubscription } from "./_components/subprocessor-subscription";

/**
 * Trust Center landing page.
 * Displays security and compliance information for Descope.
 *
 * @remarks
 * All sections are composed here with proper semantic spacing.
 * Interactive components are wrapped in Suspense for streaming.
 */
export default function TrustCenterPage() {
  return (
    <main className="flex flex-col">
      {/* Hero - First impression with trust badges and stats */}
      <HeroSection />

      {/* Compliance Grid - Certification cards with filtering */}
      <section id="certifications" className="scroll-mt-16">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              Loading certifications...
            </div>
          }
        >
          <ComplianceGrid />
        </Suspense>
      </section>

      {/* Security Overview - Security practices grid */}
      <SecurityOverview />

      {/* Document Library - Downloadable security documents */}
      <section id="documents" className="scroll-mt-16">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              Loading documents...
            </div>
          }
        >
          <DocumentLibrary />
        </Suspense>
      </section>

      {/* Subprocessors List - Third-party data processors */}
      <section id="subprocessors" className="scroll-mt-16">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              Loading subprocessors...
            </div>
          }
        >
          <SubprocessorsList />
          <div className="container mt-8">
            <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                Stay Informed
              </h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                Subscribe to receive notifications when we add or update subprocessors
              </p>
              <SubprocessorSubscription />
            </div>
          </div>
        </Suspense>
      </section>

      {/* FAQ Section - Common questions with accordion */}
      <section id="faq" className="scroll-mt-16">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              Loading FAQs...
            </div>
          }
        >
          <FAQSection />
        </Suspense>
      </section>

      {/* Contact Form - Security inquiries */}
      <section id="contact" className="scroll-mt-16">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              Loading contact form...
            </div>
          }
        >
          <ContactForm />
        </Suspense>
      </section>
    </main>
  );
}
