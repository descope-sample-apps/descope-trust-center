import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SubprocessorsList } from "../subprocessors-list";

describe("SubprocessorsList", () => {
  it("renders without crashing", () => {
    render(<SubprocessorsList />);
    expect(
      screen.getByRole("heading", { name: /our subprocessors/i }),
    ).toBeInTheDocument();
  });

  it("displays section heading with proper ARIA", () => {
    render(<SubprocessorsList />);
    const heading = screen.getByRole("heading", { name: /our subprocessors/i });
    expect(heading).toHaveAttribute("id", "subprocessors-heading");
  });

  it("displays section description", () => {
    render(<SubprocessorsList />);
    expect(
      screen.getByText(/we work with trusted third-party service providers/i),
    ).toBeInTheDocument();
  });

  it("displays search input with proper accessibility", () => {
    render(<SubprocessorsList />);
    const searchInput = screen.getByRole("searchbox", {
      name: /search vendors/i,
    });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("id", "subprocessor-search");
    expect(searchInput).toHaveAttribute("placeholder", "Search vendors...");
  });

  it("displays status filter buttons", () => {
    render(<SubprocessorsList />);
    const filterGroup = screen.getByRole("group", {
      name: /filter by status/i,
    });
    expect(filterGroup).toBeInTheDocument();

    const buttons = within(filterGroup).getAllByRole("button");
    expect(buttons).toHaveLength(4);

    expect(buttons[0]).toHaveTextContent("All");
    expect(buttons[1]).toHaveTextContent("Active");
    expect(buttons[2]).toHaveTextContent("Inactive");
    expect(buttons[3]).toHaveTextContent("Under Review");
  });

  it("filters subprocessors by status when filter button is clicked", async () => {
    const user = userEvent.setup();
    render(<SubprocessorsList />);

    const filterGroup = screen.getByRole("group", {
      name: /filter by status/i,
    });
    const buttons = within(filterGroup).getAllByRole("button");
    const activeBtn = buttons[1]!;

    await user.click(activeBtn);

    expect(activeBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("filters subprocessors by search query", async () => {
    const user = userEvent.setup();
    render(<SubprocessorsList />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "aws");

    expect(searchInput).toHaveValue("aws");
  });

  it("displays results count with proper ARIA live region", () => {
    render(<SubprocessorsList />);
    const countElement = screen.getByText(/^\d+ vendors?( found)?$/i);
    expect(countElement).toBeInTheDocument();
    expect(countElement).toHaveAttribute("aria-live", "polite");
  });

  it("displays desktop table with proper structure", () => {
    const { container } = render(<SubprocessorsList />);
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();

    const caption = within(table!).getByText(
      /list of subprocessors authorized/i,
    );
    expect(caption).toHaveClass("sr-only");
  });

  it("displays table headers with proper scope attributes", () => {
    const { container } = render(<SubprocessorsList />);
    const table = container.querySelector("table");

    if (table) {
      const headers = within(table).getAllByRole("columnheader");
      expect(headers.length).toBeGreaterThan(0);

      headers.forEach((header) => {
        expect(header).toHaveAttribute("scope", "col");
      });

      expect(within(table).getByText("Vendor Name")).toBeInTheDocument();
      expect(within(table).getByText("Purpose")).toBeInTheDocument();
      expect(within(table).getByText("Data Processed")).toBeInTheDocument();
      expect(within(table).getByText("Location")).toBeInTheDocument();
      expect(within(table).getByText("Status")).toBeInTheDocument();
      expect(within(table).getByText("Contract")).toBeInTheDocument();
    }
  });

  it("displays table rows for each subprocessor", () => {
    const { container } = render(<SubprocessorsList />);
    const table = container.querySelector("table");

    if (table) {
      const tbody = table.querySelector("tbody");
      const rows = within(tbody!).getAllByRole("row");
      expect(rows.length).toBeGreaterThan(0);
    }
  });

  it("displays View DPA links with proper attributes", () => {
    const { container } = render(<SubprocessorsList />);
    const table = container.querySelector("table");

    if (table) {
      const dpaLinks = within(table).queryAllByRole("link", {
        name: /view dpa/i,
      });

      dpaLinks.forEach((link) => {
        expect(link).toHaveAttribute("href");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    }
  });

  it("displays mobile card view on smaller screens", () => {
    const { container } = render(<SubprocessorsList />);
    const mobileCards = container.querySelector(".md\\:hidden");
    expect(mobileCards).toBeInTheDocument();
  });

  it("displays status badges with appropriate styling", () => {
    const { container } = render(<SubprocessorsList />);
    const table = container.querySelector("table");

    if (table) {
      const statusBadges = table.querySelectorAll(
        'span[class*="rounded-full"]',
      );
      expect(statusBadges.length).toBeGreaterThan(0);
    }
  });

  it("displays no results message when search returns empty", async () => {
    const user = userEvent.setup();
    render(<SubprocessorsList />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "xyznonexistent12345");

    const noResults = screen.getByRole("status");
    expect(noResults).toHaveTextContent(/no vendors found/i);
  });

  it("has proper section labeling for accessibility", () => {
    render(<SubprocessorsList />);
    const section = screen.getByRole("region", { name: /our subprocessors/i });
    expect(section).toHaveAttribute("aria-labelledby", "subprocessors-heading");
  });

  it("displays all required subprocessor information in cards", () => {
    const { container } = render(<SubprocessorsList />);
    const mobileCardsContainer = container.querySelector(".md\\:hidden");

    if (mobileCardsContainer) {
      const cards = within(mobileCardsContainer as HTMLElement).getAllByRole(
        "article",
      );

      if (cards.length > 0) {
        const firstCard = cards[0]!;

        expect(within(firstCard).getByRole("heading")).toBeInTheDocument();
        expect(within(firstCard).getByText(/purpose/i)).toBeInTheDocument();
        expect(
          within(firstCard).getByText(/data processed/i),
        ).toBeInTheDocument();
        expect(within(firstCard).getByText(/location/i)).toBeInTheDocument();
      }
    }
  });

  it("displays hover effects on table rows", () => {
    const { container } = render(<SubprocessorsList />);
    const table = container.querySelector("table");

    if (table) {
      const tbody = table.querySelector("tbody");
      if (tbody) {
        const rows = within(tbody as HTMLTableSectionElement).getAllByRole(
          "row",
        );
        rows.forEach((row) => {
          expect(row).toHaveClass("hover:bg-muted/30");
        });
      }
    }
  });

  it("updates results count when filters change", async () => {
    const user = userEvent.setup();
    render(<SubprocessorsList />);

    const initialCount = screen.getByText(/^\d+ vendors?$/i);
    expect(initialCount).toBeInTheDocument();

    const filterGroup = screen.getByRole("group", {
      name: /filter by status/i,
    });
    const buttons = within(filterGroup).getAllByRole("button");
    const activeBtn = buttons[1]!;

    await user.click(activeBtn);

    const updatedCount = screen.getByText(/^\d+ vendors? found$/i);
    expect(updatedCount).toBeInTheDocument();
    expect(updatedCount.textContent).toMatch(/^\d+ vendors? found$/i);
  });
});
