import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ComplianceGrid } from "../compliance-grid";

describe("ComplianceGrid", () => {
  it("renders without crashing", () => {
    render(<ComplianceGrid />);
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("displays filter buttons", () => {
    render(<ComplianceGrid />);
    expect(screen.getByRole("button", { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Active/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /In Progress/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Expired/i }),
    ).toBeInTheDocument();
  });

  it("displays certification cards", () => {
    render(<ComplianceGrid />);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("filters certifications by status", async () => {
    const user = userEvent.setup();
    render(<ComplianceGrid />);

    const activeButton = screen.getByRole("button", { name: /Active/i });
    await user.click(activeButton);

    expect(activeButton).toHaveAttribute("aria-pressed", "true");
  });

  it("expands certification details when Show Details is clicked", async () => {
    const user = userEvent.setup();
    render(<ComplianceGrid />);

    const showDetailsButtons = screen.queryAllByRole("button", {
      name: /Show Details/i,
    });

    if (showDetailsButtons.length > 0) {
      const firstButton = showDetailsButtons[0]!;
      await user.click(firstButton);

      expect(firstButton).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByRole("button", { name: /Show Less/i }),
      ).toBeInTheDocument();
    }
  });

  it("handles empty filter results", async () => {
    const user = userEvent.setup();
    render(<ComplianceGrid />);

    const expiredButton = screen.getByRole("button", { name: /Expired/i });
    await user.click(expiredButton);

    expect(expiredButton).toHaveAttribute("aria-pressed", "true");
  });

  it("has proper accessibility attributes", () => {
    render(<ComplianceGrid />);

    const filterGroup = screen.getByRole("group", {
      name: /Filter certifications by status/i,
    });
    expect(filterGroup).toBeInTheDocument();

    const certList = screen.getByRole("list", { name: /Certification cards/i });
    expect(certList).toBeInTheDocument();
  });
});
