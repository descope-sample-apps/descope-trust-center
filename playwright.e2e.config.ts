import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e/test-results",

  fullyParallel: !!process.env.CI,
  workers: process.env.CI ? 2 : 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  reporter: process.env.CI
    ? [["github"], ["html", { outputFolder: "./tests/e2e/playwright-report" }]]
    : [["list"], ["html", { outputFolder: "./tests/e2e/playwright-report" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["iPad Mini"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  webServer: {
    command: "pnpm dev:next",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      CI: "true",
      NODE_ENV: "development",
      POSTGRES_URL: "postgres://test:test@localhost:5432/test",
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      NEXT_PUBLIC_DESCOPE_PROJECT_ID: "test-project-id",
      NEXT_PUBLIC_SENTRY_DSN: "https://test@test.ingest.sentry.io/test",
      NEXT_PUBLIC_GA_ID: "test-ga-id",
      RESEND_API_KEY: "test-resend-api-key",
      SENTRY_ORG: "test-org",
      SENTRY_PROJECT: "test-project",
      SENTRY_AUTH_TOKEN: "test-auth-token",
    },
  },
});
