import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright configuration for visual regression testing
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Visual regression specific options
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Screenshot options for consistency
    ignoreHTTPSErrors: true,
    
    // Emulate consistent user agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },

  projects: [
    // Desktop browsers for visual regression
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },
    
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },
    
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
        hasTouch: false,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },

    // Tablet browsers for responsive testing
    {
      name: 'chromium-tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 2,
        hasTouch: true,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },
    
    {
      name: 'webkit-tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 2,
        hasTouch: true,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },

    // Mobile browsers for mobile testing
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        deviceScaleFactor: 2.625,
        hasTouch: true,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },
    
    {
      name: 'webkit-mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        hasTouch: true,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },

    // Dark mode testing project
    {
      name: 'dark-mode',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },

    // High contrast mode testing
    {
      name: 'high-contrast',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },

    // Legacy browser testing
    {
      name: 'legacy-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        deviceScaleFactor: 1,
        hasTouch: false,
      },
      testMatch: '**/visual-regression-suite.spec.ts',
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup and teardown
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  // Output directory for test results
  outputDir: 'test-results',

  // Test timeout configuration
  timeout: 60000,
  expect: {
    // Timeout for individual assertions
    timeout: 10000,
  },
});