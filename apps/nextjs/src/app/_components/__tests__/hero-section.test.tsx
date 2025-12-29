import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "../hero-section";

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

  it("has proper ARIA structure", () => {
    render(<HeroSection />);
    const section = screen.getByRole("region", { name: /hero/i });
    expect(section).toBeInTheDocument();
  });
});
