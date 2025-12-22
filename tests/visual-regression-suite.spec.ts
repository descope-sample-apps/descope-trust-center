import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Comprehensive Visual Regression Test Suite', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('complete page visual regression - desktop', async ({ page }) => {
    await vr.takeScreenshot('homepage-desktop-full', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('header and navigation visual regression', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    await vr.takeScreenshot('header-navigation', {
      clip: await header.boundingBox() || undefined,
      animations: 'disabled'
    });

    // Test responsive navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await vr.takeScreenshot('header-navigation-mobile');
  });

  test('compliance status cards visual regression', async ({ page }) => {
    const complianceSection = page.locator('[aria-labelledby="compliance-heading"]');
    await expect(complianceSection).toBeVisible();
    
    // Test individual compliance cards
    const complianceCards = page.locator('[aria-labelledby="compliance-heading"] .card');
    const cardCount = await complianceCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    for (let i = 0; i < cardCount; i++) {
      const card = complianceCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(`compliance-card-${i}`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }

    // Test hover states on compliance cards
    await page.setViewportSize({ width: 1920, height: 1080 });
    for (let i = 0; i < Math.min(cardCount, 2); i++) {
      const card = complianceCards.nth(i);
      if (await card.isVisible()) {
        await card.hover();
        await page.waitForTimeout(300);
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(`compliance-card-${i}-hover`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('security documents section visual regression', async ({ page }) => {
    const documentsSection = page.locator('[aria-labelledby="documents-heading"]');
    await expect(documentsSection).toBeVisible();
    
    // Test document cards
    const documentCards = page.locator('[aria-labelledby="documents-heading"] .card');
    const cardCount = await documentCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    for (let i = 0; i < cardCount; i++) {
      const card = documentCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(`document-card-${i}`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('security highlights section visual regression', async ({ page }) => {
    const highlightsSection = page.locator('[aria-labelledby="highlights-heading"]');
    await expect(highlightsSection).toBeVisible();
    
    // Test highlight cards
    const highlightCards = page.locator('[aria-labelledby="highlights-heading"] .card');
    const cardCount = await highlightCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    for (let i = 0; i < cardCount; i++) {
      const card = highlightCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(`highlight-card-${i}`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('FAQ section visual regression', async ({ page }) => {
    const faqSection = page.locator('.faq-section, [data-testid="faq-section"]');
    if (await faqSection.isVisible()) {
      await vr.takeScreenshot('faq-section-collapsed', {
        clip: await faqSection.boundingBox() || undefined,
        animations: 'disabled'
      });

      // Test expanded FAQ items
      const faqItems = page.locator('.faq-item, [data-testid*="faq-item"]');
      const itemCount = await faqItems.count();
      
      for (let i = 0; i < Math.min(itemCount, 3); i++) {
        const item = faqItems.nth(i);
        if (await item.isVisible()) {
          // Click to expand
          await item.click();
          await page.waitForTimeout(300);
          
          const itemBox = await item.boundingBox();
          if (itemBox) {
            await vr.takeScreenshot(`faq-item-${i}-expanded`, {
              clip: itemBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('contact section visual regression', async ({ page }) => {
    const contactSection = page.locator('section:has-text("Have Questions")');
    await expect(contactSection).toBeVisible();
    
    await vr.takeScreenshot('contact-section', {
      clip: await contactSection.boundingBox() || undefined,
      animations: 'disabled'
    });

    // Test button hover states
    const buttons = contactSection.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.hover();
        await page.waitForTimeout(300);
        const buttonBox = await button.boundingBox();
        if (buttonBox) {
          await vr.takeScreenshot(`contact-button-${i}-hover`, {
            clip: buttonBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('footer visual regression', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    await vr.takeScreenshot('footer', {
      clip: await footer.boundingBox() || undefined,
      animations: 'disabled'
    });
  });

  test('responsive design visual regression', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 414, height: 896, name: 'mobile-large' },
      { width: 375, height: 667, name: 'mobile-small' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      await vr.takeScreenshot(`responsive-${viewport.name}`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('badge and status indicator visual regression', async ({ page }) => {
    const badges = page.locator('.badge, [data-testid*="badge"]');
    const badgeCount = await badges.count();
    
    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = badges.nth(i);
        if (await badge.isVisible()) {
          const badgeBox = await badge.boundingBox();
          if (badgeBox) {
            await vr.takeScreenshot(`badge-${i}`, {
              clip: badgeBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('button interactive states visual regression', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // Test first few buttons
    const testCount = Math.min(buttonCount, 5);
    
    for (let i = 0; i < testCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Test hover state
        await button.hover();
        await page.waitForTimeout(300);
        const buttonBox = await button.boundingBox();
        if (buttonBox) {
          await vr.takeScreenshot(`button-${i}-hover`, {
            clip: buttonBox,
            animations: 'disabled'
          });
        }
        
        // Test focus state
        await button.focus();
        await page.waitForTimeout(300);
        if (buttonBox) {
          await vr.takeScreenshot(`button-${i}-focus`, {
            clip: buttonBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('typography and text rendering visual regression', async ({ page }) => {
    // Test different heading levels
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
    
    // Test main headings
    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        const headingBox = await heading.boundingBox();
        if (headingBox) {
          await vr.takeScreenshot(`heading-${i}`, {
            clip: headingBox,
            animations: 'disabled'
          });
        }
      }
    }

    // Test body text
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();
    
    if (paragraphCount > 0) {
      const firstParagraph = paragraphs.first();
      if (await firstParagraph.isVisible()) {
        const paragraphBox = await firstParagraph.boundingBox();
        if (paragraphBox) {
          await vr.takeScreenshot('paragraph-sample', {
            clip: paragraphBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('color scheme and theme testing', async ({ page }) => {
    // Test light mode (default)
    await vr.takeScreenshot('light-mode-full', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test dark mode if available
    const darkModeAvailable = await vr.testDarkMode('theme-testing');
    
    if (darkModeAvailable) {
      console.log('Dark mode tested successfully');
    } else {
      console.log('Dark mode not available - skipping dark mode tests');
    }
  });

  test('scroll behavior and layout stability', async ({ page }) => {
    // Test initial view
    await vr.takeScreenshot('scroll-initial', {
      fullPage: false,
      animations: 'disabled'
    });

    // Test scroll to middle
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);
    await vr.takeScreenshot('scroll-middle', {
      fullPage: false,
      animations: 'disabled'
    });

    // Test scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
    await vr.takeScreenshot('scroll-bottom', {
      fullPage: false,
      animations: 'disabled'
    });

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    await vr.takeScreenshot('scroll-back-to-top', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('accessibility features visual regression', async ({ page }) => {
    // Test skip link (should be hidden until focused)
    const skipLink = page.locator('a[href*="main-content"]');
    if (await skipLink.isVisible()) {
      await skipLink.focus();
      await page.waitForTimeout(300);
      const skipLinkBox = await skipLink.boundingBox();
      if (skipLinkBox) {
        await vr.takeScreenshot('skip-link-focused', {
          clip: skipLinkBox,
          animations: 'disabled'
        });
      }
    }

    // Test ARIA labels and roles
    const elementsWithAria = page.locator('[aria-label], [role]');
    const ariaCount = await elementsWithAria.count();
    
    if (ariaCount > 0) {
      console.log(`Found ${ariaCount} elements with ARIA attributes`);
    }
  });

  test('loading states and transitions visual regression', async ({ page }) => {
    // Test loading states on buttons if available
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const testButton = buttons.first();
      if (await testButton.isVisible()) {
        await vr.testLoadingStates('button:first-child', 'button-loading-state');
      }
    }
  });

  test('error handling and edge cases visual regression', async ({ page }) => {
    // Test with different network conditions
    await page.route('**/*', (route) => {
      // Allow some requests to fail to test error handling
      if (Math.random() < 0.1) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Reload page with some failures
    await page.reload();
    await page.waitForLoadState('networkidle');
    await vr.takeScreenshot('error-handling-test', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Clean up route handler
    await page.unroute('**/*');
  });
});