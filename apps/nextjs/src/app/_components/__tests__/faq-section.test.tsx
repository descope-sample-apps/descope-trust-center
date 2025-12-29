import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQSection } from "../faq-section";

describe("FAQSection", () => {
  it("renders without crashing", () => {
    render(<FAQSection />);
    expect(
      screen.getByRole("heading", { name: /Frequently Asked Questions/i }),
    ).toBeInTheDocument();
  });

  it("displays the section description", () => {
    render(<FAQSection />);
    expect(
      screen.getByText(/Find answers to common questions/i),
    ).toBeInTheDocument();
  });

  it("displays category filter tabs", () => {
    render(<FAQSection />);
    expect(screen.getByRole("button", { name: /All/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Security/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Compliance/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Privacy/i }),
    ).toBeInTheDocument();
  });

  it("displays FAQ items", () => {
    render(<FAQSection />);
    const faqButtons = screen.getAllByRole("button", { expanded: false });
    expect(faqButtons.length).toBeGreaterThan(0);
  });

  it("expands FAQ when clicked", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const allButtons = screen.getAllByRole("button");
    const faqButton = allButtons.find(
      (btn) =>
        btn.getAttribute("aria-expanded") !== null &&
        !btn.textContent?.match(/All|Security|Compliance|Privacy/),
    );

    if (faqButton) {
      expect(faqButton).toHaveAttribute("aria-expanded", "false");

      await user.click(faqButton);

      expect(faqButton).toHaveAttribute("aria-expanded", "true");
    }
  });

  it("collapses FAQ when clicked again", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const allButtons = screen.getAllByRole("button");
    const faqButton = allButtons.find(
      (btn) =>
        btn.getAttribute("aria-expanded") !== null &&
        !btn.textContent?.match(/All|Security|Compliance|Privacy/),
    );

    if (faqButton) {
      await user.click(faqButton);
      expect(faqButton).toHaveAttribute("aria-expanded", "true");

      await user.click(faqButton);
      expect(faqButton).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("supports keyboard navigation with Enter key", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const allButtons = screen.getAllByRole("button");
    const faqButton = allButtons.find(
      (btn) =>
        btn.getAttribute("aria-expanded") !== null &&
        !btn.textContent?.match(/All|Security|Compliance|Privacy/),
    );

    if (faqButton) {
      faqButton.focus();
      await user.keyboard("{Enter}");

      expect(faqButton).toHaveAttribute("aria-expanded", "true");
    }
  });

  it("filters FAQs by category", async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const securityButton = screen.getByRole("button", { name: /Security/i });
    await user.click(securityButton);

    expect(securityButton).toHaveAttribute("aria-pressed", "true");
  });

  it("displays contact link", () => {
    render(<FAQSection />);
    expect(screen.getByText(/Can't find your answer\?/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Contact us/i }),
    ).toBeInTheDocument();
  });

  it("has proper ARIA navigation", () => {
    render(<FAQSection />);
    const nav = screen.getByRole("navigation", { name: /FAQ categories/i });
    expect(nav).toBeInTheDocument();
  });
});
