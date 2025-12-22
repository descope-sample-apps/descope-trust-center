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

  /**
   * Test Descope-specific components and sections
   */
  async testDescopeComponents() {
    const components = [
      { selector: '[aria-labelledby="compliance-heading"]', name: 'compliance-section' },
      { selector: '[aria-labelledby="documents-heading"]', name: 'documents-section' },
      { selector: '[aria-labelledby="highlights-heading"]', name: 'highlights-section' },
      { selector: '.faq-section, [data-testid="faq-section"]', name: 'faq-section' },
      { selector: 'section:has-text("Have Questions")', name: 'contact-section' }
    ];

    for (const component of components) {
      const element = this.page.locator(component.selector);
      if (await element.isVisible()) {
        await this.takeScreenshot(component.name, {
          clip: await element.boundingBox() || undefined,
          animations: 'disabled'
        });
      }
    }
  }

  /**
   * Test compliance status cards with their different states
   */
  async testComplianceCards() {
    const complianceSection = this.page.locator('[aria-labelledby="compliance-heading"]');
    if (!await complianceSection.isVisible()) return;

    const complianceCards = complianceSection.locator('.card');
    const cardCount = await complianceCards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = complianceCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          // Test normal state
          await this.takeScreenshot(`compliance-card-${i}`, {
            clip: cardBox,
            animations: 'disabled'
          });

          // Test hover state
          await card.hover();
          await this.page.waitForTimeout(300);
          await this.takeScreenshot(`compliance-card-${i}-hover`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  }

  /**
   * Test document cards with download and view buttons
   */
  async testDocumentCards() {
    const documentsSection = this.page.locator('[aria-labelledby="documents-heading"]');
    if (!await documentsSection.isVisible()) return;

    const documentCards = documentsSection.locator('.card');
    const cardCount = await documentCards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = documentCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await this.takeScreenshot(`document-card-${i}`, {
            clip: cardBox,
            animations: 'disabled'
          });

          // Test button interactions
          const buttons = card.locator('button');
          const buttonCount = await buttons.count();

          for (let j = 0; j < buttonCount; j++) {
            const button = buttons.nth(j);
            if (await button.isVisible()) {
              await button.hover();
              await this.page.waitForTimeout(200);
              const buttonBox = await button.boundingBox();
              if (buttonBox) {
                await this.takeScreenshot(`document-card-${i}-button-${j}-hover`, {
                  clip: buttonBox,
                  animations: 'disabled'
                });
              }
            }
          }
        }
      }
    }
  }

  /**
   * Test FAQ section interactions
   */
  async testFAQSection() {
    const faqSection = this.page.locator('.faq-section, [data-testid="faq-section"]');
    if (!await faqSection.isVisible()) return;

    // Test collapsed state
    await this.takeScreenshot('faq-section-collapsed', {
      clip: await faqSection.boundingBox() || undefined,
      animations: 'disabled'
    });

    // Test expanded FAQ items
    const faqItems = faqSection.locator('.faq-item, [data-testid*="faq-item"]');
    const itemCount = await faqItems.count();

    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const item = faqItems.nth(i);
      if (await item.isVisible()) {
        // Click to expand
        await item.click();
        await this.page.waitForTimeout(300);

        const itemBox = await item.boundingBox();
        if (itemBox) {
          await this.takeScreenshot(`faq-item-${i}-expanded`, {
            clip: itemBox,
            animations: 'disabled'
          });
        }
      }
    }
  }

  /**
   * Test security highlights cards
   */
  async testSecurityHighlights() {
    const highlightsSection = this.page.locator('[aria-labelledby="highlights-heading"]');
    if (!await highlightsSection.isVisible()) return;

    const highlightCards = highlightsSection.locator('.card');
    const cardCount = await highlightCards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = highlightCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          // Test normal state
          await this.takeScreenshot(`highlight-card-${i}`, {
            clip: cardBox,
            animations: 'disabled'
          });

          // Test hover state
          await card.hover();
          await this.page.waitForTimeout(300);
          await this.takeScreenshot(`highlight-card-${i}-hover`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  }

  /**
   * Test badge components and status indicators
   */
  async testBadgesAndStatus() {
    const badges = this.page.locator('.badge, [data-testid*="badge"]');
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = badges.nth(i);
        if (await badge.isVisible()) {
          const badgeBox = await badge.boundingBox();
          if (badgeBox) {
            await this.takeScreenshot(`badge-${i}`, {
              clip: badgeBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  }

  /**
   * Test typography consistency across the page
   */
  async testTypography() {
    const headings = this.page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    if (headingCount > 0) {
      // Test main headings
      for (let i = 0; i < Math.min(headingCount, 3); i++) {
        const heading = headings.nth(i);
        if (await heading.isVisible()) {
          const headingBox = await heading.boundingBox();
          if (headingBox) {
            await this.takeScreenshot(`heading-${i}`, {
              clip: headingBox,
              animations: 'disabled'
            });
          }
        }
      }
    }

    // Test body text
    const paragraphs = this.page.locator('p');
    const paragraphCount = await paragraphs.count();

    if (paragraphCount > 0) {
      const firstParagraph = paragraphs.first();
      if (await firstParagraph.isVisible()) {
        const paragraphBox = await firstParagraph.boundingBox();
        if (paragraphBox) {
          await this.takeScreenshot('paragraph-sample', {
            clip: paragraphBox,
            animations: 'disabled'
          });
        }
      }
    }
  }

  /**
   * Test responsive navigation behavior
   */
  async testResponsiveNavigation() {
    const header = this.page.locator('header');
    if (!await header.isVisible()) return;

    // Test desktop navigation
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('navigation-desktop', {
      clip: await header.boundingBox() || undefined,
      animations: 'disabled'
    });

    // Test mobile navigation
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForLoadState('networkidle');
    await this.takeScreenshot('navigation-mobile', {
      clip: await header.boundingBox() || undefined,
      animations: 'disabled'
    });
  }

  /**
   * Test footer layout and content
   */
  async testFooter() {
    const footer = this.page.locator('footer');
    if (!await footer.isVisible()) return;

    await this.takeScreenshot('footer', {
      clip: await footer.boundingBox() || undefined,
      animations: 'disabled'
    });
  }
}

// Re-export base test and expect for convenience
export { test as baseTest, expect } from '@playwright/test';