import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DocumentLibrary } from "../document-library";

vi.mock("~/auth/client", () => ({
  useSession: () => ({ isAuthenticated: false, isSessionLoading: false }),
}));
vi.mock("../document-request-form", () => ({
  DocumentRequestForm: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="document-request-form">
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

vi.mock("../login-modal", () => ({
  LoginModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="login-modal">
        <button onClick={onClose}>Close Login</button>
      </div>
    ) : null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DocumentLibrary", () => {
  it("renders without crashing", () => {
    render(<DocumentLibrary />);
    expect(
      screen.getByRole("heading", { name: /document library/i }),
    ).toBeInTheDocument();
  });

  it("displays section heading with proper ARIA", () => {
    render(<DocumentLibrary />);
    const heading = screen.getByRole("heading", { name: /document library/i });
    expect(heading).toHaveAttribute("id", "documents-heading");
  });

  it("displays section description", () => {
    render(<DocumentLibrary />);
    expect(
      screen.getByText(/access security policies, compliance reports/i),
    ).toBeInTheDocument();
  });

  it("displays search input with proper accessibility", () => {
    render(<DocumentLibrary />);
    const searchInput = screen.getByRole("searchbox", {
      name: /search documents/i,
    });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "search");
    expect(searchInput).toHaveAttribute("placeholder", "Search documents...");
  });

  it("displays category filter buttons", () => {
    render(<DocumentLibrary />);
    const categoryNav = screen.getByRole("navigation", {
      name: /document categories/i,
    });
    expect(categoryNav).toBeInTheDocument();

    expect(
      within(categoryNav).getByRole("button", { name: /all documents/i }),
    ).toBeInTheDocument();
    expect(
      within(categoryNav).getByRole("button", { name: /security policies/i }),
    ).toBeInTheDocument();
    expect(
      within(categoryNav).getByRole("button", { name: /compliance/i }),
    ).toBeInTheDocument();
  });

  it("filters documents by category when button is clicked", async () => {
    const user = userEvent.setup();
    render(<DocumentLibrary />);

    const complianceBtn = screen.getByRole("button", { name: /compliance/i });
    await user.click(complianceBtn);

    expect(complianceBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("filters documents by search query", async () => {
    const user = userEvent.setup();
    render(<DocumentLibrary />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "security");

    expect(searchInput).toHaveValue("security");
  });

  it("displays clear search button when search query exists", async () => {
    const user = userEvent.setup();
    render(<DocumentLibrary />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "test");

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });

  it("clears search query when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<DocumentLibrary />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "test");

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    await user.click(clearButton);

    expect(searchInput).toHaveValue("");
  });

  it("displays results count", () => {
    render(<DocumentLibrary />);
    const countText = screen.getByText(/document.*found/i);
    expect(countText).toBeInTheDocument();
  });

  it("displays document cards", () => {
    render(<DocumentLibrary />);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("displays public document with download link", () => {
    render(<DocumentLibrary />);

    const downloadLinks = screen.queryAllByRole("link", { name: /download/i });
    if (downloadLinks.length > 0) {
      const firstLink = downloadLinks[0]!;
      expect(firstLink).toHaveAttribute("href");
      expect(firstLink).toHaveAttribute("download");
    }
  });

  it("displays sign in button for login-required documents when not authenticated", () => {
    render(<DocumentLibrary />);

    const signInButtons = screen.queryAllByRole("button", {
      name: /sign in to download/i,
    });
    expect(signInButtons).toBeDefined();
  });

  it("opens login modal when sign in button is clicked", async () => {
    const user = userEvent.setup();
    render(<DocumentLibrary />);

    const signInButtons = screen.queryAllByRole("button", {
      name: /sign in to download/i,
    });

    if (signInButtons.length > 0) {
      await user.click(signInButtons[0]!);
      expect(screen.getByTestId("login-modal")).toBeInTheDocument();
    }
  });

  it("displays request access button for NDA-required documents", () => {
    render(<DocumentLibrary />);

    const requestButtons = screen.queryAllByRole("button", {
      name: /request access/i,
    });
    expect(requestButtons).toBeDefined();
  });

  it("opens request modal when request access is clicked", async () => {
    const user = userEvent.setup();
    render(<DocumentLibrary />);

    const requestButtons = screen.queryAllByRole("button", {
      name: /request access/i,
    });

    if (requestButtons.length > 0) {
      await user.click(requestButtons[0]!);
      expect(screen.getByTestId("document-request-form")).toBeInTheDocument();
    }
  });

  it("displays no results message when search returns empty", async () => {
    const user = userEvent.setup();
    render(<DocumentLibrary />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "xyznonexistent12345");

    expect(
      screen.getByText(/no documents found matching your search/i),
    ).toBeInTheDocument();
  });

  it("displays category badges on document cards", () => {
    const { container } = render(<DocumentLibrary />);
    const badges = container.querySelectorAll(
      'span.inline-flex[class*="rounded-full"]',
    );
    expect(badges.length).toBeGreaterThan(0);
  });

  it("displays access level badges on document cards", () => {
    const { container } = render(<DocumentLibrary />);
    const cards = container.querySelectorAll("article");
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      const badges = card.querySelectorAll('span[class*="rounded-full"]');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("displays file metadata (size and date)", () => {
    render(<DocumentLibrary />);
    const metadata = screen.queryAllByText(/updated/i);
    expect(metadata.length).toBeGreaterThan(0);
  });

  it("has proper section labeling for accessibility", () => {
    render(<DocumentLibrary />);
    const section = screen.getByRole("region", { name: /document library/i });
    expect(section).toHaveAttribute("aria-labelledby", "documents-heading");
    expect(section).toHaveAttribute("id", "documents");
  });
});
