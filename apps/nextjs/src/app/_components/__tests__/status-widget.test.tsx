import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatusWidget } from "../status-widget";

// Mock tRPC
vi.mock("~/trpc/react", () => ({
  useTRPC: () => ({
    trustCenter: {
      getStatusPage: {
        queryOptions: () => ({}),
      },
    },
  }),
}));

// Mock useSuspenseQuery
const mockUseSuspenseQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useSuspenseQuery: mockUseSuspenseQuery,
}));

// Mock environment variables
vi.mock("~/env", () => ({
  env: {
    NEXT_PUBLIC_STATUSPAGE_PAGE_ID: "test-page",
    NEXT_PUBLIC_STATUSPAGE_URL: undefined,
  },
}));

describe("StatusWidget", () => {
  it("renders operational status", () => {
    mockUseSuspenseQuery.mockReturnValue({
      data: {
        result: {
          status_overall: {
            status: "Operational",
            status_code: 100,
            updated: new Date().toISOString(),
          },
          incidents: [],
          maintenance: { active: [], upcoming: [] },
        },
      },
    });

    render(<StatusWidget />);

    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View Status/i }),
    ).toBeInTheDocument();
  });

  it("renders degraded performance status", () => {
    mockUseSuspenseQuery.mockReturnValue({
      data: {
        result: {
          status_overall: {
            status: "Degraded Performance",
            status_code: 300,
            updated: new Date().toISOString(),
          },
          incidents: [],
          maintenance: { active: [], upcoming: [] },
        },
      },
    });

    render(<StatusWidget />);

    expect(screen.getByText("Degraded Performance")).toBeInTheDocument();
  });
});
