import { test, expect } from '@playwright/test';

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Button component renders correctly', async ({ page }) => {
    // Find buttons on the page
    const buttons = page.locator('button');
    
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
      await expect(buttons.first()).toHaveScreenshot('button-default.png');
    }
  });

  test('Card components render correctly', async ({ page }) => {
    // Find card elements
    const cards = page.locator('[data-testid="card"], .card, [class*="card"]');
    
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
      await expect(cards.first()).toHaveScreenshot('card-component.png');
    }
  });

  test('Form elements render correctly', async ({ page }) => {
    // Look for forms
    const forms = page.locator('form');
    
    if (await forms.count() > 0) {
      const form = forms.first();
      await expect(form).toBeVisible();
      
      // Check input fields
      const inputs = form.locator('input');
      if (await inputs.count() > 0) {
        await expect(inputs.first()).toBeVisible();
        await expect(form).toHaveScreenshot('form-with-inputs.png');
      }
      
      // Check textareas
      const textareas = form.locator('textarea');
      if (await textareas.count() > 0) {
        await expect(textareas.first()).toBeVisible();
      }
    }
  });

  test('Security overview section', async ({ page }) => {
    // Look for security-related content
    const securitySection = page.locator('[data-testid="security"], [id*="security"], [class*="security"]');
    
    if (await securitySection.isVisible()) {
      await expect(securitySection).toBeVisible();
      await expect(securitySection).toHaveScreenshot('security-section.png');
    }
  });

  test('Document library section', async ({ page }) => {
    // Look for document-related content
    const documentSection = page.locator('[data-testid="documents"], [id*="documents"], [class*="documents"]');
    
    if (await documentSection.isVisible()) {
      await expect(documentSection).toBeVisible();
      await expect(documentSection).toHaveScreenshot('document-section.png');
    }
  });

  test('Contact form functionality', async ({ page }) => {
    // Look for contact form
    const contactForm = page.locator('[data-testid="contact-form"], form[action*="contact"]');
    
    if (await contactForm.isVisible()) {
      await expect(contactForm).toBeVisible();
      
      // Test form interaction
      const nameInput = contactForm.locator('input[name*="name"], input[id*="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
        
        const emailInput = contactForm.locator('input[type="email"], input[name*="email"]');
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
          
          // Take screenshot after filling form
          await expect(contactForm).toHaveScreenshot('contact-form-filled.png');
        }
      }
    }
  });
});