import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test.describe('Interactive State Visual Tests', () => {
  let vr: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    vr = new VisualRegressionHelper(page);
    await page.goto('/');
  });

  test('button interactive states (hover, focus, active)', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // Test first few buttons
    const testCount = Math.min(buttonCount, 6);
    
    for (let i = 0; i < testCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox();
        if (!buttonBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`button-${i}-default`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await button.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`button-${i}-hover`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Test focus state
        await button.focus();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`button-${i}-focus`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Test active/pressed state
        await button.hover();
        await page.mouse.down();
        await page.waitForTimeout(100);
        await vr.takeScreenshot(`button-${i}-active`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        await page.mouse.up();
        
        // Reset focus
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    }
  });

  test('link interactive states (hover, focus, active)', async ({ page }) => {
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    // Test first few links
    const testCount = Math.min(linkCount, 5);
    
    for (let i = 0; i < testCount; i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const linkBox = await link.boundingBox();
        if (!linkBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`link-${i}-default`, {
          clip: linkBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await link.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`link-${i}-hover`, {
          clip: linkBox,
          animations: 'disabled'
        });
        
        // Test focus state
        await link.focus();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`link-${i}-focus`, {
          clip: linkBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('card interactive states (hover, focus)', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    
    // Test first few cards
    const testCount = Math.min(cardCount, 6);
    
    for (let i = 0; i < testCount; i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (!cardBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`card-${i}-default`, {
          clip: cardBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await card.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`card-${i}-hover`, {
          clip: cardBox,
          animations: 'disabled'
        });
        
        // Test focus state (if card is focusable)
        const isFocusable = await card.evaluate((el: HTMLElement) => {
          const tabindex = el.getAttribute('tabindex');
          return tabindex !== '-1';
        });
        
        if (isFocusable) {
          await card.focus();
          await page.waitForTimeout(300);
          await vr.takeScreenshot(`card-${i}-focus`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('form input interactive states (hover, focus, active)', async ({ page }) => {
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    // Test first few inputs
    const testCount = Math.min(inputCount, 4);
    
    for (let i = 0; i < testCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const inputBox = await input.boundingBox();
        if (!inputBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`input-${i}-default`, {
          clip: inputBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await input.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`input-${i}-hover`, {
          clip: inputBox,
          animations: 'disabled'
        });
        
        // Test focus state
        await input.focus();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`input-${i}-focus`, {
          clip: inputBox,
          animations: 'disabled'
        });
        
        // Test typing state
        if (await input.isVisible()) {
          await input.fill('Test content');
          await page.waitForTimeout(200);
          await vr.takeScreenshot(`input-${i}-typing`, {
            clip: inputBox,
            animations: 'disabled'
          });
          
          // Clear input for next test
          await input.fill('');
        }
      }
    }
  });

  test('compliance card interactive states', async ({ page }) => {
    const complianceSection = page.locator('[aria-labelledby="compliance-heading"]');
    if (!await complianceSection.isVisible()) return;

    const complianceCards = complianceSection.locator('.card');
    const cardCount = await complianceCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const card = complianceCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (!cardBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`compliance-card-${i}-default`, {
          clip: cardBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await card.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`compliance-card-${i}-hover`, {
          clip: cardBox,
          animations: 'disabled'
        });
        
        // Test badge hover within card
        const badges = card.locator('.badge, [data-testid*="badge"]');
        const badgeCount = await badges.count();
        
        if (badgeCount > 0) {
          const badge = badges.first();
          await badge.hover();
          await page.waitForTimeout(300);
          await vr.takeScreenshot(`compliance-card-${i}-badge-hover`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('document card button interactive states', async ({ page }) => {
    const documentsSection = page.locator('[aria-labelledby="documents-heading"]');
    if (!await documentsSection.isVisible()) return;

    const documentCards = documentsSection.locator('.card');
    const cardCount = await documentCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = documentCards.nth(i);
      if (await card.isVisible()) {
        const buttons = card.locator('button');
        const buttonCount = await buttons.count();
        
        for (let j = 0; j < buttonCount; j++) {
          const button = buttons.nth(j);
          if (await button.isVisible()) {
            const buttonBox = await button.boundingBox();
            if (!buttonBox) continue;
            
            // Test default state
            await vr.takeScreenshot(`doc-card-${i}-button-${j}-default`, {
              clip: buttonBox,
              animations: 'disabled'
            });
            
            // Test hover state
            await button.hover();
            await page.waitForTimeout(300);
            await vr.takeScreenshot(`doc-card-${i}-button-${j}-hover`, {
              clip: buttonBox,
              animations: 'disabled'
            });
            
            // Test focus state
            await button.focus();
            await page.waitForTimeout(300);
            await vr.takeScreenshot(`doc-card-${i}-button-${j}-focus`, {
              clip: buttonBox,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('FAQ item interactive states (expanded/collapsed)', async ({ page }) => {
    const faqSection = page.locator('.faq-section, [data-testid="faq-section"]');
    if (!await faqSection.isVisible()) return;

    const faqItems = faqSection.locator('.faq-item, [data-testid*="faq-item"]');
    const itemCount = await faqItems.count();
    
    for (let i = 0; i < Math.min(itemCount, 4); i++) {
      const item = faqItems.nth(i);
      if (await item.isVisible()) {
        const itemBox = await item.boundingBox();
        if (!itemBox) continue;
        
        // Test collapsed state
        await vr.takeScreenshot(`faq-item-${i}-collapsed`, {
          clip: itemBox,
          animations: 'disabled'
        });
        
        // Test hover on collapsed item
        await item.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`faq-item-${i}-hover-collapsed`, {
          clip: itemBox,
          animations: 'disabled'
        });
        
        // Click to expand
        await item.click();
        await page.waitForTimeout(500);
        
        // Test expanded state
        const expandedBox = await item.boundingBox();
        if (expandedBox) {
          await vr.takeScreenshot(`faq-item-${i}-expanded`, {
            clip: expandedBox,
            animations: 'disabled'
          });
        }
        
        // Test hover on expanded item
        await item.hover();
        await page.waitForTimeout(300);
        if (expandedBox) {
          await vr.takeScreenshot(`faq-item-${i}-hover-expanded`, {
            clip: expandedBox,
            animations: 'disabled'
          });
        }
        
        // Collapse back
        await item.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('security highlight card interactive states', async ({ page }) => {
    const highlightsSection = page.locator('[aria-labelledby="highlights-heading"]');
    if (!await highlightsSection.isVisible()) return;

    const highlightCards = highlightsSection.locator('.card');
    const cardCount = await highlightCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = highlightCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (!cardBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`highlight-card-${i}-default`, {
          clip: cardBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await card.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`highlight-card-${i}-hover`, {
          clip: cardBox,
          animations: 'disabled'
        });
        
        // Test icon hover within card
        const icons = card.locator('svg');
        const iconCount = await icons.count();
        
        if (iconCount > 0) {
          const icon = icons.first();
          await icon.hover();
          await page.waitForTimeout(300);
          await vr.takeScreenshot(`highlight-card-${i}-icon-hover`, {
            clip: cardBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('badge interactive states', async ({ page }) => {
    const badges = page.locator('.badge, [data-testid*="badge"]');
    const badgeCount = await badges.count();
    
    // Test first few badges
    const testCount = Math.min(badgeCount, 6);
    
    for (let i = 0; i < testCount; i++) {
      const badge = badges.nth(i);
      if (await badge.isVisible()) {
        const badgeBox = await badge.boundingBox();
        if (!badgeBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`badge-${i}-default`, {
          clip: badgeBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await badge.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`badge-${i}-hover`, {
          clip: badgeBox,
          animations: 'disabled'
        });
        
        // Test focus state if focusable
        const isFocusable = await badge.evaluate((el: HTMLElement) => {
          const tabindex = el.getAttribute('tabindex');
          return tabindex !== null && tabindex !== '-1';
        });
        
        if (isFocusable) {
          await badge.focus();
          await page.waitForTimeout(300);
          await vr.takeScreenshot(`badge-${i}-focus`, {
            clip: badgeBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('contact section button interactive states', async ({ page }) => {
    const contactSection = page.locator('section:has-text("Have Questions")');
    if (!await contactSection.isVisible()) return;

    const buttons = contactSection.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox();
        if (!buttonBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`contact-button-${i}-default`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await button.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`contact-button-${i}-hover`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Test focus state
        await button.focus();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`contact-button-${i}-focus`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Test active state
        await button.hover();
        await page.mouse.down();
        await page.waitForTimeout(100);
        await vr.takeScreenshot(`contact-button-${i}-active`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        await page.mouse.up();
      }
    }
  });

  test('navigation interactive states', async ({ page }) => {
    const header = page.locator('header');
    if (!await header.isVisible()) return;

    // Test navigation links and buttons
    const navElements = header.locator('a[href], button');
    const navCount = await navElements.count();
    
    for (let i = 0; i < Math.min(navCount, 4); i++) {
      const element = navElements.nth(i);
      if (await element.isVisible()) {
        const elementBox = await element.boundingBox();
        if (!elementBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`nav-${i}-default`, {
          clip: elementBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await element.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`nav-${i}-hover`, {
          clip: elementBox,
          animations: 'disabled'
        });
        
        // Test focus state
        await element.focus();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`nav-${i}-focus`, {
          clip: elementBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('icon interactive states', async ({ page }) => {
    // Test icons that are clickable or interactive
    const interactiveIcons = page.locator('button svg, a[href] svg, [role="button"] svg');
    const iconCount = await interactiveIcons.count();
    
    // Test first few icons
    const testCount = Math.min(iconCount, 6);
    
    for (let i = 0; i < testCount; i++) {
      const iconContainer = interactiveIcons.locator('..').nth(i * 2); // Get parent container
      if (await iconContainer.isVisible()) {
        const containerBox = await iconContainer.boundingBox();
        if (!containerBox) continue;
        
        // Test default state
        await vr.takeScreenshot(`icon-${i}-default`, {
          clip: containerBox,
          animations: 'disabled'
        });
        
        // Test hover state
        await iconContainer.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`icon-${i}-hover`, {
          clip: containerBox,
          animations: 'disabled'
        });
        
        // Test focus state
        await iconContainer.focus();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`icon-${i}-focus`, {
          clip: containerBox,
          animations: 'disabled'
        });
      }
    }
  });

  test('separator and divider hover states', async ({ page }) => {
    const separators = page.locator('hr, .separator, [role="separator"]');
    const separatorCount = await separators.count();
    
    if (separatorCount > 0) {
      // Test first few separators
      const testCount = Math.min(separatorCount, 3);
      
      for (let i = 0; i < testCount; i++) {
        const separator = separators.nth(i);
        if (await separator.isVisible()) {
          const separatorBox = await separator.boundingBox();
          if (!separatorBox) continue;
          
          // Test default state
          await vr.takeScreenshot(`separator-${i}-default`, {
            clip: separatorBox,
            animations: 'disabled'
          });
          
          // Test hover (if applicable)
          await separator.hover();
          await page.waitForTimeout(300);
          await vr.takeScreenshot(`separator-${i}-hover`, {
            clip: separatorBox,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('transition animations and timing', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const button = buttons.first();
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox();
        if (!buttonBox) return;
        
        // Test with animations enabled
        await vr.takeScreenshot(`transition-enabled`, {
          clip: buttonBox,
          animations: 'allowed'
        });
        
        // Test hover with animations
        await button.hover();
        await page.waitForTimeout(300);
        await vr.takeScreenshot(`transition-hover-enabled`, {
          clip: buttonBox,
          animations: 'allowed'
        });
      }
    }
  });

  test('loading and disabled states', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const button = buttons.first();
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox();
        if (!buttonBox) return;
        
        // Test loading state
        await button.evaluate((btn: HTMLButtonElement) => {
          btn.disabled = true;
          btn.classList.add('loading');
          btn.setAttribute('data-loading', 'true');
        });
        
        await page.waitForTimeout(200);
        await vr.takeScreenshot(`button-loading`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Test disabled state
        await button.evaluate((btn: HTMLButtonElement) => {
          btn.classList.remove('loading');
          btn.removeAttribute('data-loading');
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
        });
        
        await page.waitForTimeout(200);
        await vr.takeScreenshot(`button-disabled`, {
          clip: buttonBox,
          animations: 'disabled'
        });
        
        // Restore button
        await button.evaluate((btn: HTMLButtonElement) => {
          btn.disabled = false;
          btn.removeAttribute('aria-disabled');
        });
      }
    }
  });
});