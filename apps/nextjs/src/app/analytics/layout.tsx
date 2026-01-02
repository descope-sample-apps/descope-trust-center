import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { mapDescopeSession } from "~/auth/session";
import { env } from "~/env";

export const metadata: Metadata = {
  title: "Analytics Dashboard | Trust Center",
};

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const mappedSession = mapDescopeSession(session);

  if (!mappedSession?.user.email) {
    redirect("/");
  }

  // Check if user has admin access (for now, @descope.com or ADMIN_EMAILS)
  const adminEmails = env.ADMIN_EMAILS?.split(",") ?? [];
  const isAdmin =
    mappedSession.user.email.endsWith("@descope.com") ||
    adminEmails.includes(mappedSession.user.email);

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Analytics Dashboard
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a
                href="/analytics"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Overview
              </a>
              <a
                href="/analytics/downloads"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Downloads
              </a>
              <a
                href="/analytics/forms"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Forms
              </a>
              <a
                href="/analytics/requests"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Access Requests
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
