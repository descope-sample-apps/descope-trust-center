import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Accessibility Visual Tests', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('semantic structure and headings hierarchy', async ({ page }) => {
    // Test heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
    
    // Test main heading (should be h1)
    const mainHeadings = page.locator('h1');
    const mainHeadingCount = await mainHeadings.count();
    expect(mainHeadingCount).toBeGreaterThanOrEqual(1);
    
    // Visual test of heading hierarchy
    for (let i = 0; i < Math.min(headingCount, 5); i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        const headingBox = await heading.boundingBox();
        if (headingBox) {
          await vr.takeScreenshot(`heading-hierarchy-${i}`, {
            clip: headingBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('landmark regions and semantic elements', async ({ page }) => {
    const semanticElements = [
      { selector: 'header', name: 'header-landmark' },
      { selector: 'main', name: 'main-landmark' },
      { selector: 'footer', name: 'footer-landmark' },
      { selector: 'nav', name: 'navigation-landmark' },
      { selector: 'section', name: 'section-landmark' },
      { selector: 'article', name: 'article-landmark' }
    ];

    for (const element of semanticElements) {
      const el = page.locator(element.selector);
      if (await el.isVisible()) {
        const elementBox = await el.boundingBox();
        if (elementBox) {
          await vr.takeScreenshot(element.name, {
            clip: elementBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('ARIA labels and descriptions', async ({ page }) => {
    const elementsWithAria = page.locator('[aria-label], [aria-describedby], [aria-labelledby]');
    const ariaCount = await elementsWithAria.count();
    
    if (ariaCount > 0) {
      // Test elements with ARIA attributes
      for (let i = 0; i < Math.min(ariaCount, 5); i++) {
        const element = elementsWithAria.nth(i);
        if (await element.isVisible()) {
          const elementBox = await element.boundingBox();
          if (elementBox) {
            await vr.takeScreenshot(`aria-element-${i}`, {
              clip: elementBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('skip links and navigation aids', async ({ page }) => {
    // Test skip link (should be hidden until focused)
    const skipLinks = page.locator('a[href*="skip"], a[href*="main"], .skip-link');
    const skipLinkCount = await skipLinks.count();
    
    if (skipLinkCount > 0) {
      const skipLink = skipLinks.first();
      
      // Test hidden state
      await vr.takeScreenshot('skip-link-hidden', {
        clip: await skipLink.boundingBox() || undefined,
        animations: 'disabled'
      });
      
      // Test focused state
      await skipLink.focus();
      await page.waitForTimeout(300);
      await vr.takeScreenshot('skip-link-focused', {
        clip: await skipLink.boundingBox() || undefined,
        animations: 'disabled'
      });
    }
  });

  test('focus indicators and keyboard navigation', async ({ page }) => {
    // Test focus indicators on interactive elements
    const focusableElements = page.locator(
      'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const elementCount = await focusableElements.count();
    
    if (elementCount > 0) {
      // Test focus on first few elements
      const testCount = Math.min(elementCount, 5);
      
      for (let i = 0; i < testCount; i++) {
        const element = focusableElements.nth(i);
        if (await element.isVisible()) {
          await element.focus();
          await page.waitForTimeout(200);
          
          const elementBox = await element.boundingBox();
          if (elementBox) {
            await vr.takeScreenshot(`focus-indicator-${i}`, {
              clip: elementBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('button accessibility and labels', async ({ page }) => {
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Test first few buttons for accessibility
      const testCount = Math.min(buttonCount, 5);
      
      for (let i = 0; i < testCount; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const buttonBox = await button.boundingBox();
          if (buttonBox) {
            // Test normal state
            await vr.takeScreenshot(`button-a11y-${i}`, {
              clip: buttonBox,
              animations: 'disabled'
            });
            
            // Test focus state
            await button.focus();
            await page.waitForTimeout(200);
            await vr.takeScreenshot(`button-focus-a11y-${i}`, {
              clip: buttonBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('form accessibility and labels', async ({ page }) => {
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      for (let i = 0; i < formCount; i++) {
        const form = forms.nth(i);
        if (await form.isVisible()) {
          // Test form elements with labels
          const inputs = form.locator('input, textarea, select');
          const inputCount = await inputs.count();
          
          for (let j = 0; j < inputCount; j++) {
            const input = inputs.nth(j);
            if (await input.isVisible()) {
              const inputBox = await input.boundingBox();
              if (inputBox) {
                await vr.takeScreenshot(`form-input-a11y-${i}-${j}`, {
                  clip: inputBox,
                  animations: 'disabled'
                });
              }
            }
          }
        }
      }
    }
  });

  test('link accessibility and descriptions', async ({ page }) => {
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Test first few links
      const testCount = Math.min(linkCount, 5);
      
      for (let i = 0; i < testCount; i++) {
        const link = links.nth(i);
        if (await link.isVisible()) {
          const linkBox = await link.boundingBox();
          if (linkBox) {
            // Test normal state
            await vr.takeScreenshot(`link-a11y-${i}`, {
              clip: linkBox,
              animations: 'disabled'
            });
            
            // Test focus state
            await link.focus();
            await page.waitForTimeout(200);
            await vr.takeScreenshot(`link-focus-a11y-${i}`, {
              clip: linkBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('card accessibility and structure', async ({ page }) => {
    const cards = page.locator('.card, [role="article"]');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      // Test first few cards
      const testCount = Math.min(cardCount, 3);
      
      for (let i = 0; i < testCount; i++) {
        const card = cards.nth(i);
        if (await card.isVisible()) {
          const cardBox = await card.boundingBox();
          if (cardBox) {
            await vr.takeScreenshot(`card-a11y-${i}`, {
              clip: cardBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('color contrast and readability', async ({ page }) => {
    // Test text elements for contrast issues
    const textElements = page.locator('h1, h2, h3, p, span, a');
    const elementCount = await textElements.count();
    
    if (elementCount > 0) {
      // Test various text elements
      for (let i = 0; i < Math.min(elementCount, 8); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          const elementBox = await element.boundingBox();
          if (elementBox) {
            await vr.takeScreenshot(`text-contrast-${i}`, {
              clip: elementBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('high contrast mode support', async ({ page }) => {
    // Test normal contrast
    await vr.takeScreenshot('contrast-normal', {
      fullPage: false,
      animations: 'disabled'
    });
    
    // Emulate high contrast mode
    await page.emulateMedia({ forcedColors: 'active' });
    await page.waitForTimeout(500);
    
    await vr.takeScreenshot('contrast-high', {
      fullPage: false,
      animations: 'disabled'
    });
    
    // Reset to normal mode
    await page.emulateMedia({ forcedColors: 'none' });
    await page.waitForTimeout(500);
  });

  test('reduced motion support', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(500);
    
    await vr.takeScreenshot('reduced-motion', {
      fullPage: false,
      animations: 'disabled'
    });
    
    // Reset to normal motion
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(500);
  });

  test('screen reader optimizations', async ({ page }) => {
    // Test elements that should have screen reader optimizations
    const srElements = page.locator('[aria-hidden], [aria-live], [role="status"], [role="alert"]');
    const srCount = await srElements.count();
    
    if (srCount > 0) {
      for (let i = 0; i < Math.min(srCount, 3); i++) {
        const element = srElements.nth(i);
        const elementBox = await element.boundingBox();
        if (elementBox && await element.isVisible()) {
          await vr.takeScreenshot(`screen-reader-${i}`, {
            clip: elementBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('table accessibility', async ({ page }) => {
    const tables = page.locator('table, [role="table"]');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        if (await table.isVisible()) {
          const tableBox = await table.boundingBox();
          if (tableBox) {
            await vr.takeScreenshot(`table-a11y-${i}`, {
              clip: tableBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('badge and status indicator accessibility', async ({ page }) => {
    const badges = page.locator('.badge, [data-testid*="badge"], [role="status"]');
    const badgeCount = await badges.count();
    
    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = badges.nth(i);
        if (await badge.isVisible()) {
          const badgeBox = await badge.boundingBox();
          if (badgeBox) {
            await vr.takeScreenshot(`badge-a11y-${i}`, {
              clip: badgeBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('icon accessibility and labels', async ({ page }) => {
    // Test icons with proper labels
    const iconsWithLabels = page.locator('svg[aria-label], svg[title], [role="img"]');
    const iconCount = await iconsWithLabels.count();
    
    if (iconCount > 0) {
      for (let i = 0; i < Math.min(iconCount, 5); i++) {
        const icon = iconsWithLabels.nth(i);
        const iconBox = await icon.boundingBox();
        if (iconBox && iconBox.width > 0 && iconBox.height > 0) {
          await vr.takeScreenshot(`icon-a11y-${i}`, {
            clip: iconBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('keyboard navigation flow', async ({ page }) => {
    // Test tab order through focusable elements
    const focusableElements = page.locator(
      'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const elementCount = await focusableElements.count();
    
    if (elementCount > 0) {
      // Test tab navigation through first few elements
      const testCount = Math.min(elementCount, 8);
      
      for (let i = 0; i < testCount; i++) {
        const element = focusableElements.nth(i);
        if (await element.isVisible()) {
          await element.focus();
          await page.waitForTimeout(100);
          
          const elementBox = await element.boundingBox();
          if (elementBox) {
            await vr.takeScreenshot(`tab-order-${i}`, {
              clip: elementBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('error messages and validation accessibility', async ({ page }) => {
    // Look for error messages
    const errorElements = page.locator('.error, [role="alert"], [aria-live="polite"], [aria-live="assertive"]');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const error = errorElements.nth(i);
        if (await error.isVisible()) {
          const errorBox = await error.boundingBox();
          if (errorBox) {
            await vr.takeScreenshot(`error-message-${i}`, {
              clip: errorBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('magnification and zoom support', async ({ page }) => {
    // Test at different zoom levels
    const zoomLevels = [100, 150, 200];
    
    for (const zoom of zoomLevels) {
      await page.evaluate((level) => {
        document.body.style.zoom = `${level}%`;
      }, zoom);
      
      await page.waitForTimeout(500);
      
      // Test main heading at different zoom levels
      const mainHeading = page.locator('h1').first();
      if (await mainHeading.isVisible()) {
        const headingBox = await mainHeading.boundingBox();
        if (headingBox) {
          await vr.takeScreenshot(`zoom-${zoom}`, {
            clip: headingBox,
            animations: 'disabled'
          });
        }
      }
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '';
    });
    await page.waitForTimeout(500);
  });
});