import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * Footer links organized by category.
 */
function getFooterLinks(t: (key: string) => string): {
  security: { href: string; label: string; external?: boolean }[];
  company: { href: string; label: string; external?: boolean }[];
  legal: { href: string; label: string; external?: boolean }[];
} {
  return {
    security: [
      { href: "#certifications", label: t("certifications") },
      { href: "#documents", label: t("documents") },
      { href: "#subprocessors", label: t("subprocessors") },
      { href: "#faq", label: t("faq") },
    ],
    company: [
      {
        href: "https://www.descope.com",
        label: t("aboutDescope"),
        external: true,
      },
      {
        href: "https://www.descope.com/blog",
        label: t("engineeringBlog"),
        external: true,
      },
      {
        href: "https://docs.descope.com",
        label: t("documentation"),
        external: true,
      },
      {
        href: "https://www.descope.com/contact",
        label: t("contact"),
        external: true,
      },
    ],
    legal: [
      {
        href: "https://www.descope.com/privacy",
        label: t("privacyPolicy"),
        external: true,
      },
      {
        href: "https://www.descope.com/terms",
        label: t("termsOfService"),
        external: true,
      },
      {
        href: "https://www.descope.com/security-compliance",
        label: t("securityCompliance"),
        external: true,
      },
    ],
  };
}

/**
 * Social media links.
 */
function getSocialLinks(t: (key: string) => string) {
  return [
    {
      href: "https://github.com/descope",
      label: t("github"),
      icon: GitHubIcon,
    },
    {
      href: "https://twitter.com/descopeinc",
      label: t("twitter"),
      icon: TwitterIcon,
    },
    {
      href: "https://www.linkedin.com/company/descope",
      label: t("linkedin"),
      icon: LinkedInIcon,
    },
  ] as const;
}

/**
 * Trust Center footer with company info, links, and social media.
 *
 * @remarks
 * Responsive footer with multi-column layout on desktop.
 */
export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const socialLinks = getSocialLinks(t);
  const footerLinks = getFooterLinks(t);

  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/descope-logo.svg"
                alt="Descope"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {t("description")}
            </p>
            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100"
                  aria-label={link.label}
                >
                  <link.icon className="size-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Security Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("trustCenter")}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.security.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("company")}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                    {link.external && (
                      <span className="sr-only"> (opens in new tab)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("legal")}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                    {link.external && (
                      <span className="sr-only"> (opens in new tab)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t("copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * GitHub icon component.
 */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Twitter/X icon component.
 */
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * LinkedIn icon component.
 */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
