import { test as base, expect } from '@playwright/test';

// Visual regression testing utilities
export class VisualRegressionHelper {
  constructor(private page: any) {}

  /**
   * Take a screenshot with consistent naming and options
   */
  async takeScreenshot(name: string, options: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
    animations?: 'disabled' | 'allowed';
  } = {}) {
    const defaultOptions = {
      fullPage: false,
      animations: 'disabled' as const,
      ...options
    };

    // Disable animations for consistent screenshots
    if (defaultOptions.animations === 'disabled') {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
            scroll-behavior: auto !important;
          }
        `
      });
    }

    await expect(this.page).toHaveScreenshot(name, {
      fullPage: defaultOptions.fullPage,
      clip: defaultOptions.clip,
      animations: defaultOptions.animations === 'allowed' ? 'allow' : 'disabled'
    });
  }

  /**
   * Wait for element to be stable and visible
   */
  async waitForStableElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    await this.page.waitForTimeout(500); // Wait for animations
    return this.page.locator(selector);
  }

  /**
   * Check if element is in viewport
   */
  async isInViewport(selector: string) {
    const element = this.page.locator(selector);
    const boundingBox = await element.boundingBox();
    if (!boundingBox) return false;
    
    const viewport = this.page.viewportSize();
    return (
      boundingBox.x >= 0 &&
      boundingBox.y >= 0 &&
      boundingBox.x + boundingBox.width <= viewport.width &&
      boundingBox.y + boundingBox.height <= viewport.height
    );
  }

  /**
   * Test responsive design across multiple viewports
   */
  async testResponsiveViewports(testName: string, callback?: (viewport: any) => Promise<void>) {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForLoadState('networkidle');
      
      if (callback) {
        await callback(viewport);
      }
      
      await this.takeScreenshot(`${testName}-${viewport.name}.png`);
    }
  }

  /**
   * Test component hover states
   */
  async testHoverStates(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    await element.hover();
    await this.page.waitForTimeout(200); // Wait for hover transition
    await this.takeScreenshot(screenshotName);
  }

  /**
   * Test component focus states
   */
  async testFocusStates(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    await element.focus();
    await this.page.waitForTimeout(200); // Wait for focus transition
    await this.takeScreenshot(screenshotName);
  }

  /**
   * Test dark mode if available
   */
  async testDarkMode(testName: string) {
    // Look for various dark mode toggle patterns
    const darkModeSelectors = [
      '[data-theme-toggle]',
      '.dark-mode-toggle',
      'button[aria-label*="dark"]',
      'button[aria-label*="theme"]',
      '.theme-toggle',
      '[data-theme="dark"]'
    ];

    let toggleFound = false;
    for (const selector of darkModeSelectors) {
      const toggle = this.page.locator(selector);
      if (await toggle.isVisible()) {
        await toggle.click();
        await this.page.waitForTimeout(500); // Wait for theme to apply
        await this.takeScreenshot(`${testName}-dark.png`);
        toggleFound = true;
        break;
      }
    }

    return toggleFound;
  }

  /**
   * Test loading states
   */
  async testLoadingStates(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    
    // Simulate loading state if possible
    await element.evaluate((el: any) => {
      el.classList.add('loading');
      el.setAttribute('data-loading', 'true');
    });
    
    await this.page.waitForTimeout(200);
    await this.takeScreenshot(screenshotName);
    
    // Clean up
    await element.evaluate((el: any) => {
      el.classList.remove('loading');
      el.removeAttribute('data-loading');
    });
  }
}

// Re-export base test and expect for convenience
export { test as baseTest, expect } from '@playwright/test';