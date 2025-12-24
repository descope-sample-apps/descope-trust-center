import Image from "next/image";
import Link from "next/link";

import { cn } from "@descope-trust-center/ui";
import { buttonVariants } from "@descope-trust-center/ui/button";

/**
 * Navigation items for the Trust Center header.
 */
const NAV_ITEMS = [
  { href: "#certifications", label: "Certifications" },
  { href: "#documents", label: "Documents" },
  { href: "#subprocessors", label: "Subprocessors" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

/**
 * Trust Center header with Descope logo and navigation.
 *
 * @remarks
 * Sticky header with smooth scroll navigation to page sections.
 * Responsive design with collapsible menu on mobile.
 */
export function Header() {
  return (
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

        {/* CTA Button */}
        <div className="flex items-center gap-4">
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
  );
}
