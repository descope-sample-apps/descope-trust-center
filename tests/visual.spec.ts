import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads without errors
  await expect(page).toHaveTitle(/Descope Trust Center/);
  
  // Check for main heading
  await expect(page.locator('h1')).toBeVisible();
  
  // Take a visual snapshot
  await expect(page).toHaveScreenshot('homepage.png');
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check if navigation elements are present
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();
  
  // Test navigation to different sections if they exist
  const securityLink = page.locator('a[href*="security"]');
  if (await securityLink.isVisible()) {
    await securityLink.click();
    await expect(page).toHaveURL(/.*security.*/);
  }
});

test('responsive design on mobile', async ({ page }) => {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Check that mobile layout is working
  await expect(page.locator('h1')).toBeVisible();
  
  // Take mobile screenshot
  await expect(page).toHaveScreenshot('homepage-mobile.png');
});

test('dark mode visual testing', async ({ page }) => {
  await page.goto('/');
  
  // Check for dark mode toggle if it exists
  const darkModeToggle = page.locator('[data-theme-toggle], .dark-mode-toggle, button[aria-label*="dark"]');
  
  if (await darkModeToggle.isVisible()) {
    await darkModeToggle.click();
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Take screenshot of dark mode
    await expect(page).toHaveScreenshot('homepage-dark.png');
  }
});