"use client";

import { Suspense } from "react";

import { AnalyticsDashboard } from "./_components/analytics-dashboard";

/**
 * Analytics Dashboard Client Component
 *
 * Admin-only page displaying trust center analytics including:
 * - Key metrics (downloads, form submissions, pending requests)
 * - Top downloaded documents
 * - Form submission charts
 * - Date range filtering
 */
export function AnalyticsClient() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Monitor trust center activity and engagement metrics
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
              <p className="text-slate-600 dark:text-slate-300">
                Loading analytics data...
              </p>
            </div>
          </div>
        }
      >
        <AnalyticsDashboard />
      </Suspense>
    </main>
  );
}
