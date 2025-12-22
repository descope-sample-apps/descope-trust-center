import { test, expect } from '@playwright/test';
import { AdvancedVisualRegressionHelper } from './advanced-visual-regression-helper';

test.describe('Advanced Visual Regression Test Suite', () => {
  let vr: AdvancedVisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new AdvancedVisualRegressionHelper(page);
    await page.goto('/');
  });

  test('complete application visual regression', async ({ page }) => {
    // Test full page rendering
    await vr.takeScreenshot('complete-application', {
      fullPage: true,
      waitForStability: true
    });

    // Test key sections
    const sections = [
      { selector: 'header', name: 'header-section' },
      { selector: 'main', name: 'main-content' },
      { selector: 'footer', name: 'footer-section' }
    ];

    for (const section of sections) {
      const element = page.locator(section.selector);
      if (await element.isVisible()) {
        await vr.takeScreenshot(section.name, {
          clip: await element.boundingBox() || undefined
        });
      }
    }
  });

  test('comprehensive responsive design testing', async ({ page }) => {
    await vr.testResponsiveViewports('responsive-design', async () => {
      // Test that all key elements are visible in each viewport
      const keyElements = [
        'header',
        'main h1, main h2',
        '.card',
        'footer'
      ];

      for (const selector of keyElements) {
        const elements = page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          await expect(elements.first()).toBeVisible();
        }
      }
    });
  });

  test('component interaction states', async ({ page }) => {
    // Test all interactive elements
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      '[tabindex]:not([tabindex="-1"])'
    ];

    for (const selector of interactiveSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        // Test first few elements of each type
        const testCount = Math.min(count, 3);
        
        for (let i = 0; i < testCount; i++) {
          const element = elements.nth(i);
          
          if (await element.isVisible()) {
            // Test hover state
            await vr.testHoverStates(selector, `${selector.replace(/[^a-zA-Z0-9]/g, '-')}-hover-${i}`);
            
            // Test focus state
            await vr.testFocusStates(selector, `${selector.replace(/[^a-zA-Z0-9]/g, '-')}-focus-${i}`);
          }
        }
      }
    }
  });

  test('form validation and error states', async ({ page }) => {
    // Look for forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      
      if (await form.isVisible()) {
        // Test form validation
        await vr.testFormValidation('form', `form-validation-${i}`);
        
        // Test form inputs
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let j = 0; j < inputCount; j++) {
          // Test input focus and hover
          await vr.testFocusStates(`input:nth-child(${j + 1})`, `form-input-focus-${i}-${j}`);
          await vr.testHoverStates(`input:nth-child(${j + 1})`, `form-input-hover-${i}-${j}`);
        }
      }
    }
  });

  test('accessibility and ARIA compliance', async ({ page }) => {
    // Test semantic structure
    const semanticElements = [
      { selector: 'h1', expected: 1 },
      { selector: 'main', expected: 1 },
      { selector: 'header', expected: 1 },
      { selector: 'footer', expected: 1 },
      { selector: 'nav', expected: 1 },
      { selector: 'section', expected: 1 }
    ];

    for (const { selector, expected } of semanticElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (expected > 0) {
        expect(count).toBeGreaterThanOrEqual(expected);
      }
    }

    // Test ARIA attributes
    const elementsWithAria = page.locator('[aria-label], [aria-describedby], [role]');
    const ariaCount = await elementsWithAria.count();
    
    if (ariaCount > 0) {
      for (let i = 0; i < Math.min(ariaCount, 5); i++) {
        await vr.testElementAccessibility(`[aria-label], [aria-describedby], [role]:nth-child(${i + 1})`, `accessibility-${i}`);
      }
    }
  });

  test('typography and text rendering', async ({ page }) => {
    // Test text scaling
    await vr.testTextScaling('typography');
    
    // Test font rendering consistency
    const textElements = page.locator('h1, h2, h3, p, span, a');
    const textCount = await textElements.count();
    
    expect(textCount).toBeGreaterThan(0);
    
    // Test text contrast
    await vr.testColorContrast('typography-contrast');
  });

  test('image and media rendering', async ({ page }) => {
    // Test all images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Wait for all images to load
      await vr.waitForPageStability();
      
      // Test image rendering
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i);
        
        if (await image.isVisible()) {
          // Check if image is loaded
          const isLoaded = await image.evaluate((img: HTMLImageElement) => img.complete);
          expect(isLoaded).toBeTruthy();
          
          // Test image alt text
          const altText = await image.getAttribute('alt');
          expect(altText).toBeDefined();
        }
      }
      
      await vr.takeScreenshot('images-rendered');
    }
  });

  test('color scheme and theme testing', async ({ page }) => {
    // Test light mode (default)
    await vr.takeScreenshot('light-mode-theme');
    
    // Test dark mode if available
    const darkModeAvailable = await vr.testDarkMode('theme-testing');
    
    if (!darkModeAvailable) {
      console.log('Dark mode not available - skipping dark mode tests');
    }
  });

  test('performance and loading states', async ({ page }) => {
    // Test performance metrics
    await vr.testPerformanceVisuals('performance');
    
    // Test loading states
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Test loading state on first button
      await vr.testLoadingStates('button:first-child', 'button-loading-state');
    }
  });

  test('scroll behavior and layout stability', async ({ page }) => {
    // Test scroll behavior
    await vr.testScrollBehavior('scroll-behavior');
    
    // Test layout stability after scroll
    await page.evaluate(() => {
      window.scrollTo(0, 100);
    });
    
    await page.waitForTimeout(500);
    await vr.takeScreenshot('after-scroll-layout');
    
    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    await page.waitForTimeout(500);
    await vr.takeScreenshot('back-to-top-layout');
  });

  test('component boundaries and overflow', async ({ page }) => {
    // Test key components for overflow issues
    const componentSelectors = [
      '.card',
      'header',
      'main',
      'footer',
      'section'
    ];

    for (const selector of componentSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        // Test first few elements
        const testCount = Math.min(count, 3);
        
        for (let i = 0; i < testCount; i++) {
          const element = elements.nth(i);
          
          if (await element.isVisible()) {
            const boundaryInfo = await vr.testComponentBoundaries(
              `${selector}:nth-child(${i + 1})`,
              `component-boundaries-${selector.replace('.', '')}-${i}`
            );
            
            // Log any overflow issues
            if (boundaryInfo.hasHorizontalOverflow || boundaryInfo.hasVerticalOverflow) {
              console.log(`Overflow detected in ${selector} element ${i}`);
            }
          }
        }
      }
    }
  });

  test('error handling and edge cases', async ({ page }) => {
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
    await vr.waitForPageStability();
    await vr.takeScreenshot('error-handling-test');
    
    // Clean up route handler
    await page.unroute('**/*');
  });

  test('cross-device compatibility', async ({ page }) => {
    // Test various device-specific features through viewport emulation
    const devices = [
      { name: 'desktop', viewport: { width: 1920, height: 1080 } },
      { name: 'mobile', viewport: { width: 375, height: 667 } },
      { name: 'tablet', viewport: { width: 1024, height: 768 } }
    ];

    for (const device of devices) {
      await page.setViewportSize(device.viewport);
      await page.reload();
      await vr.waitForPageStability();
      
      await vr.takeScreenshot(`device-${device.name}`);
    }
  });
});