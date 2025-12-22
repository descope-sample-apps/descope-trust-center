import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Cross-Browser Visual Consistency Tests', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('homepage cross-browser consistency', async ({ page, browserName }) => {
    // Test complete homepage rendering
    await vr.takeScreenshot(`homepage-${browserName}`, {
      fullPage: true,
      animations: 'disabled'
    });

    // Test key sections consistency
    const sections = [
      { selector: 'header', name: 'header' },
      { selector: 'main', name: 'main-content' },
      { selector: 'footer', name: 'footer' }
    ];

    for (const section of sections) {
      const element = page.locator(section.selector);
      if (await element.isVisible()) {
        await vr.takeScreenshot(`${section.name}-${browserName}`, {
          clip: await element.boundingBox() || undefined,
          animations: 'disabled'
        });
      }
    }
  });

  test('compliance cards cross-browser consistency', async ({ page, browserName }) => {
    const complianceSection = page.locator('[aria-labelledby="compliance-heading"]');
    if (!await complianceSection.isVisible()) return;

    const complianceCards = complianceSection.locator('.card');
    const cardCount = await complianceCards.count();

    // Test first few cards for cross-browser consistency
    const testCount = Math.min(cardCount, 2);
    
    for (let i = 0; i < testCount; i++) {
      const card = complianceCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(`compliance-card-${i}-${browserName}`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('typography rendering cross-browser consistency', async ({ page, browserName }) => {
    // Test heading rendering
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();

    if (headingCount > 0) {
      for (let i = 0; i < Math.min(headingCount, 2); i++) {
        const heading = headings.nth(i);
        if (await heading.isVisible()) {
          const headingBox = await heading.boundingBox();
          if (headingBox) {
            await vr.takeScreenshot(`heading-${i}-${browserName}`, {
              clip: headingBox,
              animations: 'disabled'
            });
          }
        }
      }
    }

    // Test body text rendering
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();

    if (paragraphCount > 0) {
      const firstParagraph = paragraphs.first();
      if (await firstParagraph.isVisible()) {
        const paragraphBox = await firstParagraph.boundingBox();
        if (paragraphBox) {
          await vr.takeScreenshot(`paragraph-${browserName}`, {
            clip: paragraphBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('button styling cross-browser consistency', async ({ page, browserName }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    // Test first few buttons
    const testCount = Math.min(buttonCount, 3);
    
    for (let i = 0; i < testCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox();
        if (buttonBox) {
          await vr.takeScreenshot(`button-${i}-${browserName}`, {
            clip: buttonBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('badge components cross-browser consistency', async ({ page, browserName }) => {
    const badges = page.locator('.badge, [data-testid*="badge"]');
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      // Test first few badges
      const testCount = Math.min(badgeCount, 3);
      
      for (let i = 0; i < testCount; i++) {
        const badge = badges.nth(i);
        if (await badge.isVisible()) {
          const badgeBox = await badge.boundingBox();
          if (badgeBox) {
            await vr.takeScreenshot(`badge-${i}-${browserName}`, {
              clip: badgeBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('card layouts cross-browser consistency', async ({ page, browserName }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();

    // Test different card types
    const testCount = Math.min(cardCount, 4);
    
    for (let i = 0; i < testCount; i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(`card-${i}-${browserName}`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('form elements cross-browser consistency', async ({ page, browserName }) => {
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Test first few form elements
      const testCount = Math.min(inputCount, 2);
      
      for (let i = 0; i < testCount; i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const inputBox = await input.boundingBox();
          if (inputBox) {
            await vr.takeScreenshot(`input-${i}-${browserName}`, {
              clip: inputBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('navigation layout cross-browser consistency', async ({ page, browserName }) => {
    const header = page.locator('header');
    if (!await header.isVisible()) return;

    await vr.takeScreenshot(`navigation-${browserName}`, {
      clip: await header.boundingBox() || undefined,
      animations: 'disabled'
    });
  });

  test('footer layout cross-browser consistency', async ({ page, browserName }) => {
    const footer = page.locator('footer');
    if (!await footer.isVisible()) return;

    await vr.takeScreenshot(`footer-${browserName}`, {
      clip: await footer.boundingBox() || undefined,
      animations: 'disabled'
    });
  });

  test('icon rendering cross-browser consistency', async ({ page, browserName }) => {
    const icons = page.locator('svg');
    const iconCount = await icons.count();

    if (iconCount > 0) {
      // Test first few icons for consistency
      const testCount = Math.min(iconCount, 4);
      
      for (let i = 0; i < testCount; i++) {
        const icon = icons.nth(i);
        if (await icon.isVisible()) {
          const iconBox = await icon.boundingBox();
          if (iconBox && iconBox.width > 0 && iconBox.height > 0) {
            await vr.takeScreenshot(`icon-${i}-${browserName}`, {
              clip: iconBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('color rendering cross-browser consistency', async ({ page, browserName }) => {
    // Test key colored elements
    const coloredElements = page.locator('[class*="bg-"], [class*="text-"]');
    const elementCount = await coloredElements.count();

    if (elementCount > 0) {
      // Test a few colored elements
      const testCount = Math.min(elementCount, 3);
      
      for (let i = 0; i < testCount; i++) {
        const element = coloredElements.nth(i);
        if (await element.isVisible()) {
          const elementBox = await element.boundingBox();
          if (elementBox) {
            await vr.takeScreenshot(`color-element-${i}-${browserName}`, {
              clip: elementBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('spacing and layout cross-browser consistency', async ({ page, browserName }) => {
    // Test layout consistency by checking main sections
    const sections = page.locator('section');
    const sectionCount = await sections.count();

    if (sectionCount > 0) {
      // Test first few sections
      const testCount = Math.min(sectionCount, 3);
      
      for (let i = 0; i < testCount; i++) {
        const section = sections.nth(i);
        if (await section.isVisible()) {
          const sectionBox = await section.boundingBox();
          if (sectionBox) {
            await vr.takeScreenshot(`section-${i}-${browserName}`, {
              clip: sectionBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('interactive states cross-browser consistency', async ({ page, browserName }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Test hover state on first button
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await firstButton.hover();
        await page.waitForTimeout(300);
        
        const buttonBox = await firstButton.boundingBox();
        if (buttonBox) {
          await vr.takeScreenshot(`button-hover-${browserName}`, {
            clip: buttonBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('scroll behavior cross-browser consistency', async ({ page, browserName }) => {
    // Test scroll position consistency
    await page.evaluate(() => {
      window.scrollTo(0, 200);
    });
    await page.waitForTimeout(500);
    
    await vr.takeScreenshot(`scroll-position-${browserName}`, {
      fullPage: false,
      animations: 'disabled'
    });
    
    // Reset scroll
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
  });

  test('responsive behavior cross-browser consistency', async ({ page, browserName }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    await vr.takeScreenshot(`mobile-${browserName}`, {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForLoadState('networkidle');
    
    await vr.takeScreenshot(`tablet-${browserName}`, {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
  });
});