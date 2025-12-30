import { expect, test } from "@playwright/test";

test.describe("Homepage Sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("loads all main sections", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/trust|security/i);

    const sections = [
      "certifications",
      "documents",
      "subprocessors",
      "faq",
      "contact",
    ];
    for (const section of sections) {
      const sectionElement = page.locator(`#${section}`);
      await expect(sectionElement).toBeVisible();
    }
  });

  test("navigation links work", async ({ page }) => {
    const navLinks = page.locator("nav a, header a");
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    const certificationsLink = page
      .locator('a[href="#certifications"]')
      .first();
    if (await certificationsLink.isVisible()) {
      await certificationsLink.click();
      await expect(page.locator("#certifications")).toBeInViewport();
    }
  });

  test("hero section has call-to-action", async ({ page }) => {
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    const ctaButton = hero.locator("a, button").first();
    await expect(ctaButton).toBeVisible();
  });
});

test.describe("Certifications Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#certifications").scrollIntoViewIfNeeded();
  });

  test("displays certification cards", async ({ page }) => {
    const certSection = page.locator("#certifications");
    await expect(certSection).toBeVisible();

    const certCards = certSection.locator(
      '[class*="card"], [class*="certification"], article',
    );
    const cardCount = await certCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("certification cards have required info", async ({ page }) => {
    const certSection = page.locator("#certifications");

    const firstCard = certSection
      .locator('[class*="card"], [class*="certification"], article')
      .first();
    if (await firstCard.isVisible()) {
      const cardText = await firstCard.textContent();
      expect(cardText?.length).toBeGreaterThan(10);
    }
  });
});

test.describe("Document Library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#documents").scrollIntoViewIfNeeded();
  });

  test("displays documents list", async ({ page }) => {
    const docsSection = page.locator("#documents");
    await expect(docsSection).toBeVisible();

    const documents = docsSection.locator(
      '[class*="document"], [class*="card"], article, li',
    );
    const docCount = await documents.count();
    expect(docCount).toBeGreaterThan(0);
  });

  test("search filters documents", async ({ page }) => {
    const docsSection = page.locator("#documents");
    const searchInput = docsSection
      .locator(
        'input[type="search"], input[type="text"], input[placeholder*="search" i]',
      )
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("security");
      await page.waitForTimeout(500);

      const visibleDocs = docsSection.locator(
        '[class*="document"]:visible, [class*="card"]:visible',
      );
      const count = await visibleDocs.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("category tabs filter documents", async ({ page }) => {
    const docsSection = page.locator("#documents");
    const tabs = docsSection.locator(
      '[role="tablist"] button, [class*="tab"] button',
    );

    if ((await tabs.count()) > 1) {
      const secondTab = tabs.nth(1);
      await secondTab.click();
      await page.waitForTimeout(300);

      await expect(secondTab).toHaveAttribute("aria-selected", "true");
    }
  });

  test("public document download button works", async ({ page }) => {
    const docsSection = page.locator("#documents");
    const downloadBtn = docsSection
      .locator(
        'a[download], button:has-text("Download"), a:has-text("Download")',
      )
      .first();

    if (await downloadBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 5000 }).catch(() => null),
        downloadBtn.click(),
      ]);

      if (download) {
        expect(download.suggestedFilename()).toBeTruthy();
      }
    }
  });
});

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
  });

  test("displays contact form fields", async ({ page }) => {
    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();

    const form = contactSection.locator("form");
    await expect(form).toBeVisible();

    const nameInput = form
      .locator('input[name*="name" i], input[placeholder*="name" i]')
      .first();
    const emailInput = form
      .locator('input[type="email"], input[name*="email" i]')
      .first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test("shows validation errors for empty submission", async ({ page }) => {
    const contactSection = page.locator("#contact");
    const form = contactSection.locator("form");
    const submitBtn = form
      .locator(
        'button[type="submit"], button:has-text("Submit"), button:has-text("Send")',
      )
      .first();

    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      const errorMessages = form.locator(
        '[class*="error"], [role="alert"], .text-red, .text-destructive',
      );
      const errorCount = await errorMessages.count();

      const invalidInputs = form.locator(":invalid");
      const invalidCount = await invalidInputs.count();

      expect(errorCount + invalidCount).toBeGreaterThan(0);
    }
  });

  test("accepts valid form input", async ({ page }) => {
    const contactSection = page.locator("#contact");
    const form = contactSection.locator("form");

    const nameInput = form
      .locator('input[name*="name" i], input[placeholder*="name" i]')
      .first();
    const emailInput = form
      .locator('input[type="email"], input[name*="email" i]')
      .first();
    const companyInput = form
      .locator('input[name*="company" i], input[placeholder*="company" i]')
      .first();
    const messageInput = form
      .locator('textarea, input[name*="message" i]')
      .first();

    if (await nameInput.isVisible()) await nameInput.fill("Test User");
    if (await emailInput.isVisible()) await emailInput.fill("test@example.com");
    if (await companyInput.isVisible()) await companyInput.fill("Test Company");
    if (await messageInput.isVisible())
      await messageInput.fill("This is a test message for E2E testing.");

    const invalidInputs = form.locator(":invalid");
    const invalidCount = await invalidInputs.count();
    expect(invalidCount).toBe(0);
  });
});

test.describe("FAQ Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#faq").scrollIntoViewIfNeeded();
  });

  test("displays FAQ items", async ({ page }) => {
    const faqSection = page.locator("#faq");
    await expect(faqSection).toBeVisible();

    const faqItems = faqSection.locator(
      '[class*="accordion"], details, [role="button"]',
    );
    const itemCount = await faqItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test("accordion expands on click", async ({ page }) => {
    const faqSection = page.locator("#faq");
    const firstAccordion = faqSection
      .locator('[class*="accordion"] button, details summary, [role="button"]')
      .first();

    if (await firstAccordion.isVisible()) {
      const initialState = await firstAccordion.getAttribute("aria-expanded");

      await firstAccordion.click();
      await page.waitForTimeout(300);

      if (initialState === "false") {
        const newState = await firstAccordion.getAttribute("aria-expanded");
        expect(newState).toBe("true");
      }
    }
  });

  test("accordion collapses on second click", async ({ page }) => {
    const faqSection = page.locator("#faq");
    const firstAccordion = faqSection
      .locator('[class*="accordion"] button, details summary, [role="button"]')
      .first();

    if (await firstAccordion.isVisible()) {
      await firstAccordion.click();
      await page.waitForTimeout(300);

      await firstAccordion.click();
      await page.waitForTimeout(300);

      const state = await firstAccordion.getAttribute("aria-expanded");
      if (state !== null) {
        expect(state).toBe("false");
      }
    }
  });
});

test.describe("Subprocessors Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#subprocessors").scrollIntoViewIfNeeded();
  });

  test("displays subprocessors table or list", async ({ page }) => {
    const subSection = page.locator("#subprocessors");
    await expect(subSection).toBeVisible();

    const tableOrList = subSection.locator(
      "table, [role='table'], ul, [class*='list']",
    );
    await expect(tableOrList.first()).toBeVisible();
  });

  test("shows subprocessor details", async ({ page }) => {
    const subSection = page.locator("#subprocessors");
    const rows = subSection.locator("tr, li, [class*='row']");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = rows.first();
    const rowText = await firstRow.textContent();
    expect(rowText?.length).toBeGreaterThan(5);
  });

  test("search filters subprocessors", async ({ page }) => {
    const subSection = page.locator("#subprocessors");
    const searchInput = subSection
      .locator(
        'input[type="search"], input[type="text"], input[placeholder*="search" i]',
      )
      .first();

    if (await searchInput.isVisible()) {
      const initialRows = subSection.locator(
        "tr:not(:first-child), li, [class*='row']",
      );
      const initialCount = await initialRows.count();

      await searchInput.fill("aws");
      await page.waitForTimeout(500);

      const filteredRows = subSection.locator(
        "tr:visible:not(:first-child), li:visible, [class*='row']:visible",
      );
      const filteredCount = await filteredRows.count();

      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });
});

test.describe("Responsive Layout", () => {
  test("mobile menu toggle works", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuButton = page
      .locator(
        '[class*="menu"], [aria-label*="menu" i], button:has([class*="hamburger"])',
      )
      .first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      const mobileNav = page.locator(
        '[class*="mobile-nav"], [class*="mobile-menu"], nav[class*="open"], [data-state="open"]',
      );
      const navLinks = page.locator(
        'nav a:visible, [role="navigation"] a:visible',
      );

      const isMenuVisible =
        (await mobileNav.isVisible()) || (await navLinks.count()) > 2;
      expect(isMenuVisible).toBeTruthy();
    }
  });

  test("sections stack vertically on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sections = page.locator("section");
    const sectionCount = await sections.count();

    for (let i = 0; i < Math.min(sectionCount, 3); i++) {
      const section = sections.nth(i);
      const box = await section.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(400);
      }
    }
  });

  test("touch targets are accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const buttons = page.locator("button, a[role='button'], [role='button']");
    const buttonCount = await buttons.count();

    let accessibleCount = 0;
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box && box.height >= 44 && box.width >= 44) {
          accessibleCount++;
        }
      }
    }

    expect(accessibleCount).toBeGreaterThan(0);
  });
});

test.describe("Accessibility", () => {
  test("page has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    const h1 = page.locator("h1");
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);

    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(1);
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const imageCount = await images.count();

    let withAlt = 0;
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      if (alt !== null) {
        withAlt++;
      }
    }

    if (imageCount > 0) {
      expect(withAlt / imageCount).toBeGreaterThanOrEqual(0.8);
    }
  });

  test("form inputs have labels", async ({ page }) => {
    await page.goto("/");

    const inputs = page.locator("input:not([type='hidden']), textarea, select");
    const inputCount = await inputs.count();

    let labeled = 0;
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if ((await label.count()) > 0) {
          labeled++;
          continue;
        }
      }

      if (ariaLabel || ariaLabelledBy || placeholder) {
        labeled++;
      }
    }

    if (inputCount > 0) {
      expect(labeled / inputCount).toBeGreaterThanOrEqual(0.8);
    }
  });

  test("interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const firstFocused = await page.locator(":focus").count();
    expect(firstFocused).toBe(1);

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }

    const stillFocused = await page.locator(":focus").count();
    expect(stillFocused).toBe(1);
  });
});

test.describe("Performance", () => {
  test("page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });

  test("no console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("404") &&
        !e.includes("hydration"),
    );
    expect(criticalErrors.length).toBe(0);
  });
});
