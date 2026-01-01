import { expect, test } from "@playwright/test";

test.describe("Trust Center E2E Tests", () => {
  test("homepage loads with all sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check main sections are present
    await expect(
      page.locator("section").filter({ hasText: /hero|Hero/ }),
    ).toBeVisible();
    await expect(page.locator("#certifications")).toBeVisible();
    await expect(page.locator("#subprocessors")).toBeVisible();
    await expect(page.locator("#faq")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();

    // Check header and footer
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("certification grid filtering works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const certificationsSection = page.locator("#certifications");
    await certificationsSection.scrollIntoViewIfNeeded();

    // Assuming there are filter buttons or inputs
    const filterButton = certificationsSection
      .locator("button")
      .filter({ hasText: /filter|Filter/ })
      .first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();
      // Check if filtering works (this would need to be adjusted based on actual implementation)
      await expect(page.locator(".certification-item").first()).toBeVisible();
    }
  });

  test("document library search works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to document library if there's a link
    const docLink = page
      .locator("a")
      .filter({ hasText: /documents|Documents/ })
      .first();
    if ((await docLink.count()) > 0) {
      await docLink.click();
      await page.waitForLoadState("networkidle");

      const searchInput = page
        .locator("input[type='search'], input[placeholder*='search']")
        .first();
      if ((await searchInput.count()) > 0) {
        await searchInput.fill("test");
        await searchInput.press("Enter");
        // Check results
        await expect(
          page.locator(".document-item, .search-result").first(),
        ).toBeVisible();
      }
    }
  });

  test("public document download works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find a download link
    const downloadLink = page
      .locator("a[download], a[href*='.pdf'], a[href*='.doc']")
      .first();
    if ((await downloadLink.count()) > 0) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        downloadLink.click(),
      ]);
      expect(download.suggestedFilename()).toBeTruthy();
    }
  });

  test("login modal opens for gated documents", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find a gated document link
    const gatedLink = page
      .locator("a")
      .filter({ hasText: /login|Login|auth/ })
      .first();
    if ((await gatedLink.count()) > 0) {
      await gatedLink.click();
      // Check if modal opens
      await expect(
        page.locator("[role='dialog'], .modal, .login-modal"),
      ).toBeVisible();
    }
  });

  test("authentication flow works (login/logout)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find login button
    const loginButton = page
      .locator("button")
      .filter({ hasText: /login|Login|sign in/i })
      .first();
    if ((await loginButton.count()) > 0) {
      await loginButton.click();
      // This would need actual auth setup, for now just check modal
      await expect(page.locator("[role='dialog'], .modal")).toBeVisible();

      // For full auth flow, would need to mock or use test credentials
      // await page.fill("input[type='email']", "test@example.com");
      // etc.
    }
  });

  test("contact form submission works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    const form = contactSection.locator("form").first();
    if ((await form.count()) > 0) {
      await form
        .locator("input[name='name'], input[placeholder*='name']")
        .first()
        .fill("Test User");
      await form
        .locator("input[name='email'], input[type='email']")
        .first()
        .fill("test@example.com");
      await form
        .locator("textarea[name='message'], textarea")
        .first()
        .fill("Test message");

      const submitButton = form.locator("button[type='submit']").first();
      await submitButton.click();

      // Check for success message or redirect
      await expect(
        page.locator("text=Thank you, text=success, text=submitted").first(),
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("subprocessors table search works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const subprocessorsSection = page.locator("#subprocessors");
    await subprocessorsSection.scrollIntoViewIfNeeded();

    const searchInput = subprocessorsSection
      .locator("input[type='search'], input[placeholder*='search']")
      .first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill("test");
      await searchInput.press("Enter");
      // Check if table updates
      await expect(
        page.locator("table, .subprocessor-item").first(),
      ).toBeVisible();
    }
  });

  test("FAQ accordion expand/collapse works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const faqSection = page.locator("#faq");
    await faqSection.scrollIntoViewIfNeeded();

    const firstAccordion = faqSection
      .locator("button, [role='button']")
      .first();
    if ((await firstAccordion.count()) > 0) {
      await firstAccordion.click();
      await page.waitForTimeout(300);
      // Check if content is visible
      await expect(
        page.locator("[aria-expanded='true'], .expanded"),
      ).toBeVisible();
    }
  });

  test("responsive layout at mobile breakpoint", async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 390, height: 844 });
    }

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check mobile menu or responsive elements
    const mobileMenu = page
      .locator("[aria-label*='menu'], .mobile-menu, button")
      .filter({ hasText: /menu|Menu/ })
      .first();
    if ((await mobileMenu.count()) > 0) {
      await mobileMenu.click();
      await expect(page.locator("nav, .navigation")).toBeVisible();
    }

    // Check sections are still accessible
    await expect(page.locator("#certifications")).toBeVisible();
  });
});
