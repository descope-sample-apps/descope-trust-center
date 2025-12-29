import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Header } from "../header";

describe("Header", () => {
  it("renders without crashing", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("displays Descope logo", () => {
    render(<Header />);
    const logo = screen.getByAltText("Descope");
    expect(logo).toBeInTheDocument();
  });

  it("has accessible logo link", () => {
    render(<Header />);
    const logoLink = screen.getByRole("link", {
      name: /Descope Trust Center/i,
    });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("displays navigation items", () => {
    render(<Header />);
    expect(
      screen.getByRole("link", { name: /Certifications/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Documents/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Subprocessors/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /FAQ/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contact/i })).toBeInTheDocument();
  });

  it("displays CTA button", () => {
    render(<Header />);
    const ctaButton = screen.getByRole("link", { name: /Visit Descope/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute("href", "https://www.descope.com");
    expect(ctaButton).toHaveAttribute("target", "_blank");
    expect(ctaButton).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("navigation has proper ARIA label", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: /Main/i });
    expect(nav).toBeInTheDocument();
  });

  it("navigation links point to page sections", () => {
    render(<Header />);
    const certsLink = screen.getByRole("link", { name: /Certifications/i });
    expect(certsLink).toHaveAttribute("href", "#certifications");

    const docsLink = screen.getByRole("link", { name: /Documents/i });
    expect(docsLink).toHaveAttribute("href", "#documents");
  });

  it("has sticky positioning class", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("sticky");
  });
});
