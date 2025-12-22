import { test as base, expect, type Page } from '@playwright/test';

// Advanced visual regression testing utilities
export class AdvancedVisualRegressionHelper {
  constructor(public page: Page) {}

  /**
   * Take a screenshot with advanced options and consistency checks
   */
  async takeScreenshot(name: string, options: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
    animations?: 'disabled' | 'allowed';
    waitForStability?: boolean;
    maskElements?: string[];
  } = {}) {
    const defaultOptions = {
      fullPage: false,
      animations: 'disabled' as const,
      waitForStability: true,
      maskElements: [],
      ...options
    };

    // Wait for page stability if requested
    if (defaultOptions.waitForStability) {
      await this.waitForPageStability();
    }

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

    // Mask specified elements
    if (defaultOptions.maskElements.length > 0) {
      for (const selector of defaultOptions.maskElements) {
        await this.page.locator(selector).evaluate((el: HTMLElement) => {
          el.style.visibility = 'hidden';
        });
      }
    }

    await expect(this.page).toHaveScreenshot(name, {
      fullPage: defaultOptions.fullPage,
      clip: defaultOptions.clip,
      animations: defaultOptions.animations === 'allowed' ? 'allow' : 'disabled'
    });

    // Restore masked elements
    if (defaultOptions.maskElements.length > 0) {
      for (const selector of defaultOptions.maskElements) {
        await this.page.locator(selector).evaluate((el: HTMLElement) => {
          el.style.visibility = '';
        });
      }
    }
  }

  /**
   * Wait for page to be stable (no network activity, no animations)
   */
  async waitForPageStability(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForTimeout(500); // Additional wait for any remaining animations
    
    // Wait for all images to be loaded
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const images = Array.from(document.images);
        let loadedCount = 0;
        
        if (images.length === 0) {
          resolve(true);
          return;
        }
        
        images.forEach((img) => {
          if (img.complete) {
            loadedCount++;
          } else {
            img.onload = () => {
              loadedCount++;
              if (loadedCount === images.length) {
                resolve(true);
              }
            };
            img.onerror = () => {
              loadedCount++;
              if (loadedCount === images.length) {
                resolve(true);
              }
            };
          }
        });
      });
    });
  }

  /**
   * Test responsive design across multiple viewports with detailed checks
   */
  async testResponsiveViewports(testName: string, callback?: (viewport: any) => Promise<void>) {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-fullhd' },
      { width: 1440, height: 900, name: 'desktop-macbook' },
      { width: 1366, height: 768, name: 'desktop-laptop' },
      { width: 1024, height: 768, name: 'tablet-ipad' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 414, height: 896, name: 'mobile-iphone' },
      { width: 375, height: 667, name: 'mobile-small' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.waitForPageStability();
      
      if (callback) {
        await callback(viewport);
      }
      
      await this.takeScreenshot(`${testName}-${viewport.name}`);
    }
  }

  /**
   * Test component hover states with detailed checks
   */
  async testHoverStates(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    // Get initial state
    const initialBox = await element.boundingBox();
    expect(initialBox).toBeTruthy();
    
    // Hover and wait for transitions
    await element.hover();
    await this.page.waitForTimeout(300); // Wait for hover transitions
    
    // Get hover state
    const hoverBox = await element.boundingBox();
    expect(hoverBox).toBeTruthy();
    
    await this.takeScreenshot(screenshotName);
  }

  /**
   * Test component focus states with accessibility checks
   */
  async testFocusStates(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    // Focus and wait for transitions
    await element.focus();
    await this.page.waitForTimeout(300);
    
    // Check if element is actually focused
    const isFocused = await element.evaluate((el: HTMLElement) => 
      el === document.activeElement
    );
    expect(isFocused).toBeTruthy();
    
    await this.takeScreenshot(screenshotName);
  }

  /**
   * Test dark mode if available with comprehensive checks
   */
  async testDarkMode(testName: string) {
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
        await this.page.waitForTimeout(800); // Wait for theme transition
        await this.waitForPageStability();
        await this.takeScreenshot(`${testName}-dark`);
        toggleFound = true;
        break;
      }
    }

    return toggleFound;
  }

  /**
   * Test loading states with animation checks
   */
  async testLoadingStates(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    // Add loading class
    await element.evaluate((el: HTMLElement) => {
      el.classList.add('loading');
      el.setAttribute('data-loading', 'true');
    });
    
    await this.page.waitForTimeout(300);
    await this.takeScreenshot(screenshotName);
    
    // Remove loading class
    await element.evaluate((el: HTMLElement) => {
      el.classList.remove('loading');
      el.removeAttribute('data-loading');
    });
  }

  /**
   * Test scroll behavior with smooth scrolling
   */
  async testScrollBehavior(testName: string) {
    // Test scroll to different positions
    const scrollPositions = [
      { x: 0, y: 0, name: 'top' },
      { x: 0, y: 500, name: 'middle' },
      { x: 0, y: document.body.scrollHeight, name: 'bottom' }
    ];

    for (const position of scrollPositions) {
      await this.page.evaluate((pos) => {
        window.scrollTo(pos.x, pos.y);
      }, position);
      
      await this.page.waitForTimeout(500);
      await this.takeScreenshot(`${testName}-scroll-${position.name}`);
    }
  }

  /**
   * Test text scaling and font rendering
   */
  async testTextScaling(testName: string) {
    const scales = [100, 120, 150]; // Percentage scales
    
    for (const scale of scales) {
      await this.page.evaluate((scaleValue) => {
        document.body.style.fontSize = `${scaleValue}%`;
      }, scale);
      
      await this.page.waitForTimeout(500);
      await this.takeScreenshot(`${testName}-text-scale-${scale}`);
    }
    
    // Reset font size
    await this.page.evaluate(() => {
      document.body.style.fontSize = '';
    });
  }

  /**
   * Test color contrast and accessibility
   */
  async testColorContrast(testName: string) {
    // Test normal contrast
    await this.takeScreenshot(`${testName}-normal-contrast`);
    
    // Test high contrast mode if supported
    await this.page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(`${testName}-high-contrast`);
    
    // Reset
    await this.page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
  }

  /**
   * Test component boundaries and overflow
   */
  async testComponentBoundaries(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    // Check for overflow issues
    const hasOverflow = await element.evaluate((el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el);
      const parent = el.parentElement;
      
      return {
        hasHorizontalOverflow: parent ? rect.width > parent.clientWidth : false,
        hasVerticalOverflow: parent ? rect.height > parent.clientHeight : false,
        overflowX: computedStyle.overflowX,
        overflowY: computedStyle.overflowY
      };
    });
    
    await this.takeScreenshot(screenshotName);
    return hasOverflow;
  }

  /**
   * Test element visibility and accessibility
   */
  async testElementAccessibility(selector: string, screenshotName: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    // Check accessibility attributes
    const accessibilityInfo = await element.evaluate((el: HTMLElement) => {
      return {
        hasAriaLabel: !!el.getAttribute('aria-label'),
        hasAriaDescribedBy: !!el.getAttribute('aria-describedby'),
        hasTabIndex: el.tabIndex >= 0,
        hasRole: !!el.getAttribute('role'),
        isFocusable: el.tabIndex >= 0 || el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT'
      };
    });
    
    await this.takeScreenshot(screenshotName);
    return accessibilityInfo;
  }

  /**
   * Test form validation states
   */
  async testFormValidation(formSelector: string, screenshotName: string) {
    const form = this.page.locator(formSelector);
    await expect(form).toBeVisible();
    
    // Test empty form validation
    const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await this.page.waitForTimeout(1000);
      
      // Check for error messages
      const errorMessages = form.locator('.error, [data-testid*="error"], [role="alert"]');
      const hasErrors = await errorMessages.count() > 0;
      
      await this.takeScreenshot(screenshotName);
      return hasErrors;
    }
    
    return false;
  }

  /**
   * Test performance-related visual aspects
   */
  async testPerformanceVisuals(testName: string) {
    // Test rendering performance
    const startTime = Date.now();
    await this.waitForPageStability();
    const renderTime = Date.now() - startTime;
    
    // Take screenshot for visual reference
    await this.takeScreenshot(`${testName}-performance`);
    
    return { renderTime };
  }
}

// Re-export base test and expect for convenience
export { test as baseTest, expect } from '@playwright/test';