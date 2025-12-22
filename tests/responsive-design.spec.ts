import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Responsive Design Visual Tests', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('complete page responsive design testing', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-fullhd' },
      { width: 1440, height: 900, name: 'desktop-macbook' },
      { width: 1366, height: 768, name: 'desktop-laptop' },
      { width: 1024, height: 768, name: 'tablet-ipad' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 414, height: 896, name: 'mobile-iphone-pro' },
      { width: 375, height: 667, name: 'mobile-iphone-se' }
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

  test('header responsive behavior', async ({ page }) => {
    const header = page.locator('header');
    if (!await header.isVisible()) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'header-desktop' },
      { width: 1024, height: 768, name: 'header-tablet' },
      { width: 768, height: 1024, name: 'header-tablet-portrait' },
      { width: 375, height: 667, name: 'header-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      const headerBox = await header.boundingBox();
      if (headerBox) {
        await vr.takeScreenshot(viewport.name, {
          clip: headerBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('compliance cards responsive layout', async ({ page }) => {
    const complianceSection = page.locator('[aria-labelledby="compliance-heading"]');
    if (!await complianceSection.isVisible()) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'compliance-desktop' },
      { width: 1024, height: 768, name: 'compliance-tablet' },
      { width: 768, height: 1024, name: 'compliance-tablet-portrait' },
      { width: 375, height: 667, name: 'compliance-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      const sectionBox = await complianceSection.boundingBox();
      if (sectionBox) {
        await vr.takeScreenshot(viewport.name, {
          clip: sectionBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('document cards responsive layout', async ({ page }) => {
    const documentsSection = page.locator('[aria-labelledby="documents-heading"]');
    if (!await documentsSection.isVisible()) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'documents-desktop' },
      { width: 1024, height: 768, name: 'documents-tablet' },
      { width: 768, height: 1024, name: 'documents-tablet-portrait' },
      { width: 375, height: 667, name: 'documents-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      const sectionBox = await documentsSection.boundingBox();
      if (sectionBox) {
        await vr.takeScreenshot(viewport.name, {
          clip: sectionBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('security highlights responsive layout', async ({ page }) => {
    const highlightsSection = page.locator('[aria-labelledby="highlights-heading"]');
    if (!await highlightsSection.isVisible()) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'highlights-desktop' },
      { width: 1024, height: 768, name: 'highlights-tablet' },
      { width: 768, height: 1024, name: 'highlights-tablet-portrait' },
      { width: 375, height: 667, name: 'highlights-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      const sectionBox = await highlightsSection.boundingBox();
      if (sectionBox) {
        await vr.takeScreenshot(viewport.name, {
          clip: sectionBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('FAQ section responsive behavior', async ({ page }) => {
    const faqSection = page.locator('.faq-section, [data-testid="faq-section"]');
    if (!await faqSection.isVisible()) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'faq-desktop' },
      { width: 1024, height: 768, name: 'faq-tablet' },
      { width: 768, height: 1024, name: 'faq-tablet-portrait' },
      { width: 375, height: 667, name: 'faq-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      const sectionBox = await faqSection.boundingBox();
      if (sectionBox) {
        await vr.takeScreenshot(viewport.name, {
          clip: sectionBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('contact section responsive layout', async ({ page }) => {
    const contactSection = page.locator('section:has-text("Have Questions")');
    if (!await contactSection.isVisible()) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'contact-desktop' },
      { width: 1024, height: 768, name: 'contact-tablet' },
      { width: 768, height: 1024, name: 'contact-tablet-portrait' },
      { width: 375, height: 667, name: 'contact-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      const sectionBox = await contactSection.boundingBox();
      if (sectionBox) {
        await vr.takeScreenshot(viewport.name, {
          clip: sectionBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('footer responsive layout', async ({ page }) => {
    const footer = page.locator('footer');
    if (!await footer.isVisible()) return;

    const viewports = [
      { width: 1920, height: 1080, name: 'footer-desktop' },
      { width: 1024, height: 768, name: 'footer-tablet' },
      { width: 768, height: 1024, name: 'footer-tablet-portrait' },
      { width: 375, height: 667, name: 'footer-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      const footerBox = await footer.boundingBox();
      if (footerBox) {
        await vr.takeScreenshot(viewport.name, {
          clip: footerBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('typography responsive scaling', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'typography-desktop' },
      { width: 1024, height: 768, name: 'typography-tablet' },
      { width: 375, height: 667, name: 'typography-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test main heading
      const mainHeading = page.locator('h1').first();
      if (await mainHeading.isVisible()) {
        const headingBox = await mainHeading.boundingBox();
        if (headingBox) {
          await vr.takeScreenshot(viewport.name, {
            clip: headingBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('button responsive sizing', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'button-desktop' },
      { width: 1024, height: 768, name: 'button-tablet' },
      { width: 375, height: 667, name: 'button-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test first few buttons
      const buttons = page.locator('button').first();
      if (await buttons.isVisible()) {
        const buttonBox = await buttons.boundingBox();
        if (buttonBox) {
          await vr.takeScreenshot(viewport.name, {
            clip: buttonBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('card responsive behavior', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'card-desktop' },
      { width: 1024, height: 768, name: 'card-tablet' },
      { width: 375, height: 667, name: 'card-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test first card
      const firstCard = page.locator('.card').first();
      if (await firstCard.isVisible()) {
        const cardBox = await firstCard.boundingBox();
        if (cardBox) {
          await vr.takeScreenshot(viewport.name, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('grid and layout responsive behavior', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'grid-desktop' },
      { width: 1024, height: 768, name: 'grid-tablet' },
      { width: 768, height: 1024, name: 'grid-tablet-portrait' },
      { width: 375, height: 667, name: 'grid-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test grid sections
      const gridSections = page.locator('[class*="grid"], [class*="lg:grid"], [class*="md:grid"], [class*="sm:grid"]');
      const sectionCount = await gridSections.count();
      
      if (sectionCount > 0) {
        const firstSection = gridSections.first();
        if (await firstSection.isVisible()) {
          const sectionBox = await firstSection.boundingBox();
          if (sectionBox) {
            await vr.takeScreenshot(viewport.name, {
              clip: sectionBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('navigation responsive behavior', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'nav-desktop' },
      { width: 1024, height: 768, name: 'nav-tablet' },
      { width: 768, height: 1024, name: 'nav-tablet-portrait' },
      { width: 375, height: 667, name: 'nav-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test navigation elements
      const navElements = page.locator('nav, [role="navigation"]');
      const navCount = await navElements.count();
      
      if (navCount > 0) {
        const nav = navElements.first();
        if (await nav.isVisible()) {
          const navBox = await nav.boundingBox();
          if (navBox) {
            await vr.takeScreenshot(viewport.name, {
              clip: navBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('spacing and padding responsive behavior', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'spacing-desktop' },
      { width: 1024, height: 768, name: 'spacing-tablet' },
      { width: 375, height: 667, name: 'spacing-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test main content area
      const mainContent = page.locator('main');
      if (await mainContent.isVisible()) {
        const mainBox = await mainContent.boundingBox();
        if (mainBox) {
          await vr.takeScreenshot(viewport.name, {
            clip: mainBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('image and media responsive behavior', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'media-desktop' },
      { width: 1024, height: 768, name: 'media-tablet' },
      { width: 375, height: 667, name: 'media-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const firstImage = images.first();
        if (await firstImage.isVisible()) {
          const imageBox = await firstImage.boundingBox();
          if (imageBox) {
            await vr.takeScreenshot(viewport.name, {
              clip: imageBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('form elements responsive behavior', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'form-desktop' },
      { width: 1024, height: 768, name: 'form-tablet' },
      { width: 375, height: 667, name: 'form-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test form elements
      const formElements = page.locator('input, textarea, select');
      const elementCount = await formElements.count();
      
      if (elementCount > 0) {
        const firstElement = formElements.first();
        if (await firstElement.isVisible()) {
          const elementBox = await firstElement.boundingBox();
          if (elementBox) {
            await vr.takeScreenshot(viewport.name, {
              clip: elementBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('overflow and scrollbar behavior', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'overflow-desktop' },
      { width: 1024, height: 768, name: 'overflow-tablet' },
      { width: 375, height: 667, name: 'overflow-mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Test for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      
      const hasHorizontalOverflow = bodyWidth > viewportWidth;
      
      await vr.takeScreenshot(viewport.name, {
        fullPage: false,
        animations: 'disabled'
      });
      
      if (hasHorizontalOverflow) {
        console.log(`Horizontal overflow detected in ${viewport.name}`);
      }
    }
  });
});