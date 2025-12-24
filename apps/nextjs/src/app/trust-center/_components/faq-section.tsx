"use client";

import type { FAQ, FAQCategory } from "@descope-trust-center/validators";
import { useCallback, useState } from "react";
import Link from "next/link";

import { cn } from "@descope-trust-center/ui";

import faqsData from "~/app/data/faqs.json";

/** Category display configuration */
const CATEGORIES: { id: FAQCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "security", label: "Security" },
  { id: "compliance", label: "Compliance" },
  { id: "privacy", label: "Privacy" },
  { id: "data-handling", label: "Data Handling" },
  { id: "authentication", label: "Authentication" },
  { id: "general", label: "General" },
];

/**
 * FAQ Section component with expandable accordion items.
 * Features category filtering, keyboard navigation, and smooth animations.
 *
 * @remarks
 * Uses client-side interactivity for accordion expand/collapse.
 * Respects prefers-reduced-motion for accessibility.
 */
export function FAQSection() {
  const faqs = faqsData as FAQ[];
  const [activeCategory, setActiveCategory] = useState<FAQCategory | "all">(
    "all",
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleExpanded(id);
      }
    },
    [toggleExpanded],
  );

  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-white px-4 py-16 sm:px-6 md:py-24 lg:px-8 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="text-center">
          <h2
            id="faq-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Find answers to common questions about our security, compliance, and
            data practices.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-10">
          <nav
            aria-label="FAQ categories"
            className="flex flex-wrap justify-center gap-2"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-slate-300",
                  activeCategory === category.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                )}
                aria-pressed={activeCategory === category.id}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-10 divide-y divide-slate-200 dark:divide-slate-700">
          {filteredFaqs.length === 0 ? (
            <p className="py-8 text-center text-slate-500 dark:text-slate-400">
              No FAQs found in this category.
            </p>
          ) : (
            filteredFaqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedIds.has(faq.id)}
                onToggle={() => toggleExpanded(faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
              />
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Can&apos;t find your answer?{" "}
            <Link
              href="mailto:security@descope.com"
              className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Individual FAQ accordion item with expand/collapse functionality.
 */
function FAQItem({
  faq,
  isExpanded,
  onToggle,
  onKeyDown,
}: {
  faq: FAQ;
  isExpanded: boolean;
  onToggle: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const answerId = `faq-answer-${faq.id}`;

  return (
    <div className="py-6">
      <button
        type="button"
        onClick={onToggle}
        onKeyDown={onKeyDown}
        aria-expanded={isExpanded}
        aria-controls={answerId}
        className={cn(
          "flex w-full items-start justify-between gap-4 text-left",
          "focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-slate-300",
          "group",
        )}
      >
        <span className="text-base font-medium text-slate-900 group-hover:text-slate-700 sm:text-lg dark:text-white dark:group-hover:text-slate-200">
          {faq.question}
        </span>
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800",
            "transition-transform duration-200 motion-reduce:transition-none",
            isExpanded && "rotate-180",
          )}
          aria-hidden="true"
        >
          <ChevronDownIcon className="size-4 text-slate-600 dark:text-slate-400" />
        </span>
      </button>
      <div
        id={answerId}
        role="region"
        aria-labelledby={`faq-question-${faq.id}`}
        className={cn(
          "grid transition-all duration-300 ease-in-out motion-reduce:transition-none",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="pt-4 text-slate-600 dark:text-slate-300">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Chevron down icon for accordion toggle indicator.
 */
function ChevronDownIcon({ className }: { className?: string }) {
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
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
