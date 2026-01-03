import "@testing-library/jest-dom/vitest";

// Mock next-intl globally
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const getNestedValue = (obj: any, path: string) => {
      return path.split(".").reduce((current, k) => current?.[k], obj);
    };
    const translations = {
      hero: {
        badge: "SOC 2 Type II Certified",
        headline: "Security & Compliance at Descope",
        subheadline:
          "Your trust is our foundation. We maintain rigorous security standards and compliance certifications to ensure your data is always protected.",
        cta1: "View Our Certifications",
        cta2: "Browse Security Docs",
        trustedCertifications: "Trusted Certifications",
        stats: {
          uptime: "Uptime SLA",
          breaches: "Data Breaches",
          monitoring: "Security Monitoring",
        },
      },
      header: {
        certifications: "Certifications",
        documents: "Documents",
        subprocessors: "Subprocessors",
        faq: "FAQ",
        contact: "Contact",
        signIn: "Sign in",
        signOut: "Sign out",
        visitDescope: "Visit Descope",
      },
      footer: {
        trustCenter: "Trust Center",
        company: "Company",
        legal: "Legal",
        description:
          "Enterprise-grade authentication and user management for modern applications. SOC 2 Type II certified.",
        github: "GitHub",
        twitter: "Twitter",
        linkedin: "LinkedIn",
        aboutDescope: "About Descope",
        engineeringBlog: "Engineering Blog",
        documentation: "Documentation",
        contact: "Contact",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        securityCompliance: "Security & Compliance",
        copyright: "© {year} Descope, Inc. All rights reserved.",
      },
      page: {
        loading: {
          certifications: "Loading certifications...",
          documents: "Loading documents...",
          subprocessors: "Loading subprocessors...",
          faq: "Loading FAQ...",
          contact: "Loading contact form...",
        },
        subscription: {
          title: "Stay Updated",
          description:
            "Get notified when new subprocessors are added or updated.",
        },
      },
    };
    return getNestedValue(translations, key) || key;
  }),
  getTranslations: vi.fn(() => (key: string) => {
    const getNestedValue = (obj: any, path: string) => {
      return path.split(".").reduce((current, k) => current?.[k], obj);
    };
    const translations = {
      page: {
        loading: {
          certifications: "Loading certifications...",
          documents: "Loading documents...",
          subprocessors: "Loading subprocessors...",
          faq: "Loading FAQ...",
          contact: "Loading contact form...",
        },
        subscription: {
          title: "Stay Updated",
          description:
            "Get notified when new subprocessors are added or updated.",
        },
      },
    };
    return getNestedValue(translations, key) || key;
  }),
}));
