import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroSection } from "../hero-section";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      badge: "SOC 2 Type II Certified",
      headline: "Security & Compliance at Descope",
      subheadline:
        "Your trust is our foundation. We maintain rigorous security standards and compliance certifications to ensure your data is always protected.",
      cta1: "View Our Certifications",
      cta2: "Browse Security Docs",
      trustedCertifications: "Trusted Certifications",
      "stats.uptime": "Uptime SLA",
      "stats.breaches": "Data Breaches",
      "stats.monitoring": "Security Monitoring",
    };
    return translations[key] ?? key;
  }),
}));

describe("HeroSection", () => {
  it("renders without crashing", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("displays the main headline", () => {
    render(<HeroSection />);
    expect(
      screen.getByText("Security & Compliance at Descope"),
    ).toBeInTheDocument();
  });

  it("displays the subheadline text", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/Your trust is our foundation/i),
    ).toBeInTheDocument();
  });

  it("displays SOC 2 certification badge", () => {
    render(<HeroSection />);
    expect(screen.getByText("SOC 2 Type II Certified")).toBeInTheDocument();
  });

  it("displays CTA buttons", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("link", { name: /View Our Certifications/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse Security Docs/i }),
    ).toBeInTheDocument();
  });

  it("displays trust stats", () => {
    render(<HeroSection />);
    expect(screen.getByText("99.99%")).toBeInTheDocument();
    expect(screen.getByText("Uptime SLA")).toBeInTheDocument();
    expect(screen.getByText("Zero")).toBeInTheDocument();
    expect(screen.getByText("Data Breaches")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
    expect(screen.getByText("Security Monitoring")).toBeInTheDocument();
  });

  it("displays featured certifications section", () => {
    render(<HeroSection />);
    expect(screen.getByText("Trusted Certifications")).toBeInTheDocument();
  });

  it("has proper heading structure", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
