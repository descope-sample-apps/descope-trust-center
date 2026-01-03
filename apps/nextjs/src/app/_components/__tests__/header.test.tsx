import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "../header";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations = {
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
    };
    return translations.header[key as keyof typeof translations.header] || key;
  }),
}));

vi.mock("~/auth/client", () => ({
  useSession: () => ({ isAuthenticated: false, isSessionLoading: false }),
  useUser: () => ({ user: { name: null, email: null } }),
  useDescope: () => ({ logout: vi.fn() }),
}));

vi.mock("../login-modal", () => ({
  LoginModal: () => null,
}));

vi.mock("../language-switcher", () => ({
  LanguageSwitcher: () => <div>Language Switcher</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

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
