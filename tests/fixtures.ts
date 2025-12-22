import { test as base, expect } from '@playwright/test';

// Extend the base test with custom fixtures
export const test = base.extend({
  // Custom page fixture with common setup
  page: async ({ page }, use) => {
    // Set default timeout
    page.setDefaultTimeout(30000);
    
    // Handle console errors
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.log('Browser console error:', message.text());
      }
    });
    
    // Handle page errors
    page.on('pageerror', (error) => {
      console.log('Page error:', error.message);
    });
    
    await use(page);
  },
});

// Export expect from base
export { expect };

// Common test utilities
export const TestUtils = {
  // Wait for element to be visible and stable
  async waitForStableElement(page: any, selector: string, timeout = 5000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    await page.waitForTimeout(500); // Wait for animations
    return page.locator(selector);
  },
  
  // Take screenshot with consistent naming
  async takeScreenshot(page: any, name: string, fullPage = false) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await page.screenshot({ path: `test-results/${filename}`, fullPage });
    return filename;
  },
  
  // Check if element is in viewport
  async isInViewport(page: any, selector: string) {
    const element = page.locator(selector);
    const boundingBox = await element.boundingBox();
    if (!boundingBox) return false;
    
    const viewport = page.viewportSize();
    return (
      boundingBox.x >= 0 &&
      boundingBox.y >= 0 &&
      boundingBox.x + boundingBox.width <= viewport.width &&
      boundingBox.y + boundingBox.height <= viewport.height
    );
  }
};