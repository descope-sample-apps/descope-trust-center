import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "../footer";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(
    () => (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
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
        certifications: "Certifications",
        documents: "Security Documents",
        subprocessors: "Subprocessors",
        faq: "FAQ",
      };
      let result = translations[key] ?? key;
      if (params) {
        Object.keys(params).forEach((p) => {
          result = result.replace(`{${p}}`, String(params[p]));
        });
      }
      return result;
    },
  ),
}));

describe("Footer", () => {
  it("renders without crashing", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("displays Descope logo", () => {
    render(<Footer />);
    const logo = screen.getByAltText("Descope");
    expect(logo).toBeInTheDocument();
  });

  it("displays company description", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Enterprise-grade authentication/i),
    ).toBeInTheDocument();
  });

  it("displays Trust Center links", () => {
    render(<Footer />);
    expect(
      screen.getByRole("heading", { name: /Trust Center/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Certifications/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Security Documents/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Subprocessors/i }),
    ).toBeInTheDocument();
  });

  it("displays Company links", () => {
    render(<Footer />);
    expect(
      screen.getByRole("heading", { name: /Company/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /About Descope/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Engineering Blog/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Documentation/i }),
    ).toBeInTheDocument();
  });

  it("displays Legal links", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { name: /Legal/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Privacy Policy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Terms of Service/i }),
    ).toBeInTheDocument();
  });

  it("displays social media links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Twitter/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /LinkedIn/i })).toBeInTheDocument();
  });

  it("displays copyright notice with current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} Descope, Inc`)),
    ).toBeInTheDocument();
  });

  it("external links have proper attributes", () => {
    render(<Footer />);
    const externalLink = screen.getByRole("link", {
      name: /About Descope/i,
    });
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
