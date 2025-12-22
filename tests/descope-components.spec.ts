import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Descope Trust Center - Component Visual Tests', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('compliance status cards visual regression', async ({ page }) => {
    await vr.testComplianceCards();
  });

  test('security documents section visual regression', async ({ page }) => {
    await vr.testDocumentCards();
  });

  test('security highlights section visual regression', async ({ page }) => {
    await vr.testSecurityHighlights();
  });

  test('FAQ section interactions visual regression', async ({ page }) => {
    await vr.testFAQSection();
  });

  test('badge and status indicator visual regression', async ({ page }) => {
    await vr.testBadgesAndStatus();
  });

  test('typography and text rendering visual regression', async ({ page }) => {
    await vr.testTypography();
  });

  test('responsive navigation visual regression', async ({ page }) => {
    await vr.testResponsiveNavigation();
  });

  test('footer layout and content visual regression', async ({ page }) => {
    await vr.testFooter();
  });

  test('complete Descope components visual regression', async ({ page }) => {
    await vr.testDescopeComponents();
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

  test('card hover effects and transitions visual regression', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    // Test first few cards
    const testCount = Math.min(cardCount, 6);
    
    for (let i = 0; i < testCount; i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        // Test normal state
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(`card-${i}-normal`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
        
        // Test hover state
        await card.hover();
        await page.waitForTimeout(300);
        if (cardBox) {
          await vr.takeScreenshot(`card-${i}-hover`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('header and branding visual regression', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Test header in desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    await vr.takeScreenshot('header-desktop', {
      clip: await header.boundingBox() || undefined,
      animations: 'disabled'
    });
    
    // Test header in mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await vr.takeScreenshot('header-mobile', {
      clip: await header.boundingBox() || undefined,
      animations: 'disabled'
    });
  });

  test('contact section buttons and interactions visual regression', async ({ page }) => {
    const contactSection = page.locator('section:has-text("Have Questions")');
    if (await contactSection.isVisible()) {
      // Test section layout
      await vr.takeScreenshot('contact-section-layout', {
        clip: await contactSection.boundingBox() || undefined,
        animations: 'disabled'
      });

      // Test button interactions
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
    }
  });

  test('separator and layout elements visual regression', async ({ page }) => {
    const separators = page.locator('hr, .separator, [role="separator"]');
    const separatorCount = await separators.count();
    
    if (separatorCount > 0) {
      for (let i = 0; i < Math.min(separatorCount, 3); i++) {
        const separator = separators.nth(i);
        if (await separator.isVisible()) {
          const separatorBox = await separator.boundingBox();
          if (separatorBox) {
            await vr.takeScreenshot(`separator-${i}`, {
              clip: separatorBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('icon and visual elements consistency visual regression', async ({ page }) => {
    // Test Lucide icons consistency
    const icons = page.locator('svg');
    const iconCount = await icons.count();
    
    if (iconCount > 0) {
      // Test first few icons for consistency
      const testCount = Math.min(iconCount, 8);
      
      for (let i = 0; i < testCount; i++) {
        const icon = icons.nth(i);
        if (await icon.isVisible()) {
          const iconBox = await icon.boundingBox();
          if (iconBox && iconBox.width > 0 && iconBox.height > 0) {
            await vr.takeScreenshot(`icon-${i}`, {
              clip: iconBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('color scheme and theme consistency visual regression', async ({ page }) => {
    // Test light mode (default)
    await vr.takeScreenshot('light-mode-complete', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test dark mode if available
    const darkModeAvailable = await vr.testDarkMode('theme-consistency');
    
    if (darkModeAvailable) {
      console.log('Dark mode tested successfully for theme consistency');
    } else {
      console.log('Dark mode not available - skipping dark mode consistency tests');
    }
  });

  test('scroll behavior and layout stability visual regression', async ({ page }) => {
    // Test initial view
    await vr.takeScreenshot('scroll-stability-initial', {
      fullPage: false,
      animations: 'disabled'
    });

    // Test scroll to middle
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);
    await vr.takeScreenshot('scroll-stability-middle', {
      fullPage: false,
      animations: 'disabled'
    });

    // Test scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
    await vr.takeScreenshot('scroll-stability-bottom', {
      fullPage: false,
      animations: 'disabled'
    });

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    await vr.takeScreenshot('scroll-stability-back-to-top', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('loading states and error handling visual regression', async ({ page }) => {
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
      console.log(`Found ${ariaCount} elements with ARIA attributes for visual testing`);
    }
  });
});