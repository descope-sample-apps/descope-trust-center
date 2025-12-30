"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@descope-trust-center/ui";
import { Button, buttonVariants } from "@descope-trust-center/ui/button";

import { useDescope, useSession, useUser } from "~/auth/client";
import { LoginModal } from "./login-modal";

const NAV_ITEMS = [
  { href: "#certifications", label: "Certifications" },
  { href: "#documents", label: "Documents" },
  { href: "#subprocessors", label: "Subprocessors" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

/**
 * Trust Center header with Descope logo, navigation, and auth controls.
 */
export function Header() {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();
  const { logout } = useDescope();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.refresh();
  }, [logout, router]);

  return (
    <>
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/descope-logo.svg"
              alt="Descope"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="sr-only">Descope Trust Center</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth & CTA */}
          <div className="flex items-center gap-3">
            {isSessionLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
            ) : isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-300">
                  {user.name ?? user.email ?? "User"}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowLoginModal(true)}
              >
                Sign in
              </Button>
            )}
            <Link
              href="https://www.descope.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              Visit Descope
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
