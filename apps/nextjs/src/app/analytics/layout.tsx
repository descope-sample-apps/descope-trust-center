"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSession } from "~/auth/client";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSessionLoading } = useSession();
  const pathname = usePathname();

  if (isSessionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need to be logged in to access analytics.
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/analytics", label: "Overview" },
    { href: "/analytics/downloads", label: "Downloads" },
    { href: "/analytics/access-requests", label: "Access Requests" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor Trust Center engagement and manage access requests
          </p>
        </div>

        <nav className="mb-6">
          <ul className="flex space-x-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {children}
      </div>
    </div>
  );
}
