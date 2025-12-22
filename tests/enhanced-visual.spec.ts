import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Enhanced Visual Tests', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('homepage visual regression across viewports', async ({ page }) => {
    await vr.testResponsiveViewports('homepage');
  });

  test('component hover states', async ({ page }) => {
    // Test button hover states
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      await vr.testHoverStates('button', 'button-hover');
    }

    // Test link hover states
    const links = page.locator('a');
    if (await links.count() > 0) {
      await vr.testHoverStates('a', 'link-hover');
    }
  });

  test('component focus states', async ({ page }) => {
    // Test button focus states
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      await vr.testFocusStates('button', 'button-focus');
    }

    // Test input focus states
    const inputs = page.locator('input');
    if (await inputs.count() > 0) {
      await vr.testFocusStates('input', 'input-focus');
    }
  });

  test('form interaction visual testing', async ({ page }) => {
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      const form = forms.first();
      
      // Test empty form
      await vr.takeScreenshot('form-empty');
      
      // Fill form fields
      const nameInput = form.locator('input[name*="name"], input[id*="name"], input[type="text"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
      }
      
      const emailInput = form.locator('input[type="email"], input[name*="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
      }
      
      const messageTextarea = form.locator('textarea').first();
      if (await messageTextarea.isVisible()) {
        await messageTextarea.fill('This is a test message for visual testing.');
      }
      
      // Test filled form
      await vr.takeScreenshot('form-filled');
      
      // Test form validation (if applicable)
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000); // Wait for validation
        await vr.takeScreenshot('form-validation');
      }
    }
  });

  test('navigation menu visual testing', async ({ page }) => {
    const nav = page.locator('nav, header nav, [role="navigation"]');
    if (await nav.isVisible()) {
      // Test closed navigation
      await vr.takeScreenshot('nav-closed');
      
      // Test mobile menu toggle if present
      const menuToggle = page.locator('button[aria-label*="menu"], .menu-toggle, .hamburger');
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await page.waitForTimeout(300);
        await vr.takeScreenshot('nav-open');
      }
    }
  });

  test('card component visual testing', async ({ page }) => {
    const cards = page.locator('[data-testid="card"], .card, [class*="card"]');
    if (await cards.count() > 0) {
      const firstCard = cards.first();
      
      // Test card default state
      await vr.takeScreenshot('card-default');
      
      // Test card hover if interactive
      const isClickable = await firstCard.evaluate((el: any) => {
        return el.onclick || el.tagName === 'A' || el.getAttribute('role') === 'button';
      });
      
      if (isClickable) {
        await vr.testHoverStates('[class*="card"]', 'card-hover');
      }
    }
  });

  test('modal/dialog visual testing', async ({ page }) => {
    // Look for modal triggers
    const modalTriggers = page.locator('button[aria-label*="open"], button[data-modal], [data-testid*="modal-trigger"]');
    
    if (await modalTriggers.count() > 0) {
      await modalTriggers.first().click();
      await page.waitForTimeout(300);
      
      const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
      if (await modal.isVisible()) {
        await vr.takeScreenshot('modal-open');
        
        // Test modal close
        const closeButton = modal.locator('button[aria-label*="close"], .close, [data-testid*="close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(300);
          await vr.takeScreenshot('modal-closed');
        }
      }
    }
  });

  test('table component visual testing', async ({ page }) => {
    const tables = page.locator('table, [data-testid="table"], .table');
    if (await tables.count() > 0) {
      const table = tables.first();
      
      // Test table default state
      await vr.takeScreenshot('table-default');
      
      // Test table sorting if headers are clickable
      const headers = table.locator('th');
      if (await headers.count() > 0) {
        const firstHeader = headers.first();
        const isSortable = await firstHeader.evaluate((el: any) => {
          return el.onclick || el.getAttribute('aria-sort') || el.classList.contains('sortable');
        });
        
        if (isSortable) {
          await firstHeader.click();
          await page.waitForTimeout(500);
          await vr.takeScreenshot('table-sorted');
        }
      }
    }
  });

  test('loading states visual testing', async ({ page }) => {
    // Test button loading states
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      await vr.testLoadingStates('button', 'button-loading');
    }
  });

  test('scroll behavior visual testing', async ({ page }) => {
    // Test scroll to top/bottom if there are scrollable elements
    const scrollableElements = page.locator('[data-scroll], .scrollable, [style*="overflow"]');
    
    if (await scrollableElements.count() > 0) {
      const element = scrollableElements.first();
      
      // Scroll to middle
      await element.evaluate((el: any) => {
        el.scrollTop = el.scrollHeight / 2;
      });
      await page.waitForTimeout(300);
      await vr.takeScreenshot('scroll-middle');
      
      // Scroll to bottom
      await element.evaluate((el: any) => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(300);
      await vr.takeScreenshot('scroll-bottom');
    }
  });

  test('error states visual testing', async ({ page }) => {
    // Test form error states
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      const form = forms.first();
      
      // Try to submit empty required fields
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Check for error messages
        const errorMessages = form.locator('.error, [data-testid*="error"], [role="alert"]');
        if (await errorMessages.count() > 0) {
          await vr.takeScreenshot('form-errors');
        }
      }
    }
  });
});