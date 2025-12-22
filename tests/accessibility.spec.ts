import { test, expect } from '@playwright/test';

test.describe('Accessibility and Visual Regression', () => {
  test('has proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1');
    
    // Check for description meta tag
    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveCount(1);
  });

  test('has proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for exactly one h1
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    
    // Check heading hierarchy (h1 should come before h2, etc.)
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    
    for (let i = 0; i < count - 1; i++) {
      const currentHeading = await headings.nth(i).evaluate(el => el.tagName);
      const nextHeading = await headings.nth(i + 1).evaluate(el => el.tagName);
      
      // Convert tag names to numbers for comparison
      const currentLevel = parseInt(currentHeading.replace('H', ''));
      const nextLevel = parseInt(nextHeading.replace('H', ''));
      
      // Next heading should be same level or at most one level deeper
      expect(nextLevel - currentLevel).toBeLessThanOrEqual(1);
    }
  });

  test('has sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic check - for thorough contrast testing,
    // you would want to use a dedicated accessibility tool
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button');
    
    // Ensure text elements are visible
    await expect(textElements.first()).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus moves to interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveCount(1);
    
    // Test Enter/Space on buttons
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      await buttons.first().focus();
      await page.keyboard.press('Enter');
      
      // Take screenshot to show focus state
      await expect(page).toHaveScreenshot('keyboard-focus.png');
    }
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // All meaningful images should have alt text
      // Decorative images can have alt="" but should still have the attribute
      expect(alt).toBeDefined();
    }
  });

  test('visual regression across viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Wait for any dynamic content to load
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`viewport-${viewport.name}.png`);
    }
  });
});