import { AnalyticsClient } from "./client";

export const dynamic = "force-dynamic";

/**
 * Analytics Dashboard Page
 *
 * Admin-only page displaying trust center analytics including:
 * - Key metrics (downloads, form submissions, pending requests)
 * - Top downloaded documents
 * - Form submission charts
 * - Date range filtering
 */
export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
