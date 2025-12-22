import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Cross-Browser Visual Consistency Tests', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('homepage visual consistency across browsers', async ({ page, browserName }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Take browser-specific screenshot
    await vr.takeScreenshot(`homepage-${browserName}`);
    
    // Verify key elements are visible
    const header = page.locator('header');
    const mainContent = page.locator('main');
    const footer = page.locator('footer');
    
    await expect(header).toBeVisible();
    await expect(mainContent).toBeVisible();
    await expect(footer).toBeVisible();
  });

  test('compliance cards cross-browser consistency', async ({ page, browserName }) => {
    const complianceSection = page.locator('[aria-labelledby="compliance-heading"]');
    await expect(complianceSection).toBeVisible();
    
    // Test card layout consistency
    const complianceCards = complianceSection.locator('.card');
    const cardCount = await complianceCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    // Take screenshot of compliance section
    await vr.takeScreenshot(`compliance-section-${browserName}`);
    
    // Test individual card consistency
    for (let i = 0; i < Math.min(cardCount, 2); i++) {
      const card = complianceCards.nth(i);
      await expect(card).toBeVisible();
      
      // Test card content
      const title = card.locator('.card-title');
      const description = card.locator('.card-description');
      const badge = card.locator('.badge');
      
      await expect(title).toBeVisible();
      await expect(description).toBeVisible();
      await expect(badge).toBeVisible();
      
      await vr.takeScreenshot(`compliance-card-${i}-${browserName}`);
    }
  });

  test('document cards cross-browser consistency', async ({ page, browserName }) => {
    const documentsSection = page.locator('[aria-labelledby="documents-heading"]');
    await expect(documentsSection).toBeVisible();
    
    // Test document card layout
    const documentCards = documentsSection.locator('.card');
    const cardCount = await documentCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    await vr.takeScreenshot(`documents-section-${browserName}`);
    
    // Test button consistency across browsers
    const buttons = documentsSection.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 4); i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      
      // Test button hover state
      await button.hover();
      await page.waitForTimeout(200);
      await vr.takeScreenshot(`document-button-${i}-hover-${browserName}`);
    }
  });

  test('security highlights cross-browser consistency', async ({ page, browserName }) => {
    const highlightsSection = page.locator('[aria-labelledby="highlights-heading"]');
    await expect(highlightsSection).toBeVisible();
    
    // Test highlight cards
    const highlightCards = highlightsSection.locator('.card');
    const cardCount = await highlightCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    await vr.takeScreenshot(`highlights-section-${browserName}`);
    
    // Test icon rendering consistency
    for (let i = 0; i < cardCount; i++) {
      const card = highlightCards.nth(i);
      const iconContainer = card.locator('.bg-blue-100, .bg-green-100, .bg-purple-100');
      await expect(iconContainer).toBeVisible();
      
      const icon = iconContainer.locator('svg');
      await expect(icon).toBeVisible();
    }
  });

  test('FAQ section cross-browser consistency', async ({ page, browserName }) => {
    const faqSection = page.locator('section:has("h3:text-is(\'Frequently Asked Questions\')")');
    if (await faqSection.isVisible()) {
      await expect(faqSection).toBeVisible();
      
      // Test FAQ accordion consistency
      const faqCards = faqSection.locator('.card');
      const cardCount = await faqCards.count();
      
      if (cardCount > 0) {
        await vr.takeScreenshot(`faq-section-${browserName}`);
        
        // Test accordion interaction
        const firstCard = faqCards.first();
        const firstAccordionItem = firstCard.locator('[role="button"], [data-state="closed"]').first();
        
        if (await firstAccordionItem.isVisible()) {
          // Test closed state
          await vr.takeScreenshot(`faq-closed-${browserName}`);
          
          // Test open state
          await firstAccordionItem.click();
          await page.waitForTimeout(300);
          await vr.takeScreenshot(`faq-open-${browserName}`);
          
          // Close again
          await firstAccordionItem.click();
          await page.waitForTimeout(300);
        }
      }
    }
  });

  test('typography and text rendering cross-browser consistency', async ({ page, browserName }) => {
    // Test heading consistency
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
    
    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i);
      await expect(heading).toBeVisible();
    }
    
    // Test paragraph text rendering
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();
    
    expect(paragraphCount).toBeGreaterThan(0);
    
    // Take screenshot of text content
    await vr.takeScreenshot(`typography-${browserName}`);
  });

  test('button and interactive element cross-browser consistency', async ({ page, browserName }) => {
    // Test all buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test button states
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      
      // Test focus state
      await button.focus();
      await page.waitForTimeout(200);
      await vr.takeScreenshot(`button-focus-${i}-${browserName}`);
      
      // Test hover state
      await button.hover();
      await page.waitForTimeout(200);
      await vr.takeScreenshot(`button-hover-${i}-${browserName}`);
    }
  });

  test('badge and status indicator cross-browser consistency', async ({ page, browserName }) => {
    // Test all badges
    const badges = page.locator('.badge');
    const badgeCount = await badges.count();
    
    if (badgeCount > 0) {
      await vr.takeScreenshot(`badges-${browserName}`);
      
      // Test individual badge rendering
      for (let i = 0; i < Math.min(badgeCount, 3); i++) {
        const badge = badges.nth(i);
        await expect(badge).toBeVisible();
        
        // Check badge content
        const badgeText = await badge.textContent();
        expect(badgeText?.length).toBeGreaterThan(0);
      }
    }
  });

  test('responsive layout cross-browser consistency', async ({ page, browserName }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await vr.takeScreenshot(`mobile-layout-${browserName}`);
    
    // Test tablet view
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    await vr.takeScreenshot(`tablet-layout-${browserName}`);
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await vr.takeScreenshot(`desktop-layout-${browserName}`);
  });

  test('color and theme cross-browser consistency', async ({ page, browserName }) => {
    // Test color scheme consistency
    const primaryElements = page.locator('.text-primary, .bg-primary, .border-primary');
    const primaryCount = await primaryElements.count();
    
    if (primaryCount > 0) {
      await vr.takeScreenshot(`primary-colors-${browserName}`);
    }
    
    // Test background colors
    const backgroundElements = page.locator('.bg-background, .bg-card, .bg-muted');
    const backgroundCount = await backgroundElements.count();
    
    if (backgroundCount > 0) {
      await vr.takeScreenshot(`background-colors-${browserName}`);
    }
  });

  test('form and input cross-browser consistency', async ({ page, browserName }) => {
    // Look for any input elements
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      await vr.takeScreenshot(`form-elements-${browserName}`);
      
      // Test input focus state
      const firstInput = inputs.first();
      await firstInput.focus();
      await page.waitForTimeout(200);
      await vr.takeScreenshot(`input-focus-${browserName}`);
    }
  });

  test('icon and SVG cross-browser consistency', async ({ page, browserName }) => {
    // Test all SVG icons
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();
    
    expect(svgCount).toBeGreaterThan(0);
    
    // Test icon rendering
    for (let i = 0; i < Math.min(svgCount, 5); i++) {
      const svg = svgs.nth(i);
      await expect(svg).toBeVisible();
    }
    
    await vr.takeScreenshot(`icons-${browserName}`);
  });
});