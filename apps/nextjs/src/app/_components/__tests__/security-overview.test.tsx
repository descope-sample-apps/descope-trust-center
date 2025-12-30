import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SecurityOverview } from "../security-overview";

describe("SecurityOverview", () => {
  it("renders without crashing", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByRole("heading", { name: /our security practices/i }),
    ).toBeInTheDocument();
  });

  it("displays the section heading with proper ARIA", () => {
    render(<SecurityOverview />);
    const heading = screen.getByRole("heading", {
      name: /our security practices/i,
    });
    expect(heading).toHaveAttribute("id", "security-overview-heading");
  });

  it("displays the section description", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByText(/security is at the core of everything we do/i),
    ).toBeInTheDocument();
  });

  it("has proper section labeling for accessibility", () => {
    render(<SecurityOverview />);
    const section = screen.getByRole("region", {
      name: /our security practices/i,
    });
    expect(section).toHaveAttribute(
      "aria-labelledby",
      "security-overview-heading",
    );
  });

  it("displays all six security practice cards", () => {
    render(<SecurityOverview />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(6);
  });

  it("displays Encryption at Rest & Transit card", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByRole("heading", { name: /encryption at rest & transit/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/all data is protected with industry-leading/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/aes-256 encryption at rest/i)).toBeInTheDocument();
    expect(
      screen.getByText(/tls 1.3 encryption in transit/i),
    ).toBeInTheDocument();
  });

  it("displays Access Controls card", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByRole("heading", { name: /access controls/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/enterprise-grade authentication/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/role-based access control/i)).toBeInTheDocument();
    expect(
      screen.getByText(/multi-factor authentication/i),
    ).toBeInTheDocument();
  });

  it("displays Infrastructure Security card", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByRole("heading", { name: /infrastructure security/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/built on soc 2 certified cloud infrastructure/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/99.99% uptime sla/i)).toBeInTheDocument();
  });

  it("displays Incident Response card", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByRole("heading", { name: /incident response/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/rapid detection and response/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/24\/7 security monitoring/i)).toBeInTheDocument();
  });

  it("displays Data Privacy card", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByRole("heading", { name: /data privacy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/committed to protecting personal data/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/gdpr compliant/i)).toBeInTheDocument();
    expect(screen.getByText(/ccpa compliant/i)).toBeInTheDocument();
  });

  it("displays Vulnerability Management card", () => {
    render(<SecurityOverview />);
    expect(
      screen.getByRole("heading", { name: /vulnerability management/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/continuous security testing/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/annual third-party pentests/i),
    ).toBeInTheDocument();
  });

  it("displays icons for each security practice", () => {
    const { container } = render(<SecurityOverview />);
    const icons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThanOrEqual(6);
  });

  it("displays highlight lists with checkmarks", () => {
    render(<SecurityOverview />);
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThan(0);

    lists.forEach((list) => {
      expect(list).toHaveAttribute("aria-label");
    });
  });

  it("renders cards in a grid layout", () => {
    const { container } = render(<SecurityOverview />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("gap-6");
  });

  it("has hover effects on cards", () => {
    const { container } = render(<SecurityOverview />);
    const cards = container.querySelectorAll("article");
    cards.forEach((card) => {
      expect(card).toHaveClass("hover:shadow-md");
    });
  });

  it("displays proper semantic HTML structure", () => {
    const { container } = render(<SecurityOverview />);
    const section = container.querySelector("section");
    const header = section?.querySelector("header");
    const articles = section?.querySelectorAll("article");

    expect(section).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(articles?.length).toBeGreaterThan(0);
  });
});
