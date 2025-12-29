import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "./tests/visual/test-results",

  fullyParallel: !!process.env.CI,
  workers: process.env.CI ? 2 : 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { outputFolder: "./tests/visual/playwright-report" }],
      ]
    : [
        ["list"],
        ["html", { outputFolder: "./tests/visual/playwright-report" }],
      ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  snapshotPathTemplate:
    "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}",

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
    },
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
      AUTH_SECRET: "test-secret-for-playwright-visual-tests",
      AUTH_DISCORD_ID: "test-discord-id",
      AUTH_DISCORD_SECRET: "test-discord-secret",
    },
  },
});
