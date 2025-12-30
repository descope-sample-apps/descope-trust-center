import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { cn } from "@descope-trust-center/ui";

import { getSession } from "~/auth/server";

export const metadata: Metadata = {
  title: "Admin Dashboard | Descope Trust Center",
  description: "Analytics and management dashboard for Descope Trust Center",
};

const ADMIN_DOMAINS = ["descope.com"];
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? [];

function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  const domain = email.split("@")[1];
  return domain ? ADMIN_DOMAINS.includes(domain) : false;
}

const navItems = [
  { href: "/admin/analytics", label: "Overview" },
  { href: "/admin/analytics/downloads", label: "Downloads" },
  { href: "/admin/analytics/submissions", label: "Submissions" },
  { href: "/admin/analytics/access-requests", label: "Access Requests" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const email =
    typeof session?.token?.email === "string" ? session.token.email : null;

  if (!email || !isAdmin(email)) {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <nav className="hidden md:flex">
                <ul className="flex gap-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">{email}</span>
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ← Back to Trust Center
              </Link>
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
