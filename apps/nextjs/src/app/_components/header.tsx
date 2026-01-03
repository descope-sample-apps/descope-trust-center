"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@descope-trust-center/ui";
import { Button, buttonVariants } from "@descope-trust-center/ui/button";

import { useDescope, useSession, useUser } from "~/auth/client";
import { LanguageSwitcher } from "./language-switcher";
import { LoginModal } from "./login-modal";

export function Header() {
  const t = useTranslations("header");
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();
  const { logout } = useDescope();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { href: "#certifications", label: t("certifications") },
    { href: "#documents", label: t("documents") },
    { href: "#subprocessors", label: t("subprocessors") },
    { href: "#faq", label: t("faq") },
    { href: "#contact", label: t("contact") },
  ] as const;

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      closeMobileMenu();
      await logout();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, router, closeMobileMenu]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        closeMobileMenu();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen, closeMobileMenu]);

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
                  "flex min-h-[44px] items-center", // Touch target size
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md p-2 transition-colors md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="size-6" />
            ) : (
              <MenuIcon className="size-6" />
            )}
          </button>

          {/* Auth & CTA - Desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            {isSessionLoading ? (
              <div className="h-11 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
            ) : isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-600 lg:inline dark:text-slate-300">
                  {user.name ?? user.email ?? "Signed in"}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="min-h-[44px] px-4"
                >
                  {t("signOut")}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                onClick={() => setShowLoginModal(true)}
                className="min-h-[44px] px-4"
              >
                {t("signIn")}
              </Button>
            )}
            <Link
              href="https://www.descope.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "hidden min-h-[44px] px-4 lg:inline-flex",
              )}
            >
              {t("visitDescope")}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <nav
              className="container mx-auto space-y-1 px-4 py-4 sm:px-6"
              aria-label="Mobile navigation"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "text-muted-foreground hover:text-foreground hover:bg-accent block rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                    "min-h-[44px]", // Touch target size
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t pt-4">
                {isSessionLoading ? (
                  <div className="h-11 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                ) : isAuthenticated ? (
                  <>
                    {(user.name ?? user.email) ? (
                      <div className="mb-2 px-3 text-sm text-slate-600 dark:text-slate-300">
                        {user.name ?? user.email}
                      </div>
                    ) : null}
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="min-h-[44px] w-full justify-start"
                    >
                      {t("signOut")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => {
                      setShowLoginModal(true);
                      closeMobileMenu();
                    }}
                    className="min-h-[44px] w-full"
                  >
                    {t("signIn")}
                  </Button>
                )}
                <div className="mt-4">
                  <LanguageSwitcher />
                </div>
                <Link
                  href="https://www.descope.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-2 min-h-[44px] w-full",
                  )}
                >
                  {t("visitDescope")}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

/**
 * Hamburger menu icon (three horizontal lines).
 */
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

/**
 * Close icon (X).
 */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
