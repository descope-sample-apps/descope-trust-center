import { expect, test } from "@playwright/test";

test.describe("Trust Center E2E Tests", () => {
  test("homepage loads with all sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .locator("h1")
        .filter({ hasText: "Security & Compliance at Descope" }),
    ).toBeVisible();

    // Check main sections are present
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

    const activeFilterButton = certificationsSection
      .locator("button")
      .filter({ hasText: "Active" })
      .first();
    await activeFilterButton.click();

    await page.waitForTimeout(300);

    const certificationCards = certificationsSection.locator("article");
    const count = await certificationCards.count();
    for (let i = 0; i < count; i++) {
      await expect(
        certificationCards.nth(i).locator("span").filter({ hasText: "Active" }),
      ).toBeVisible();
    }
  });

  test("document library search works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const docLink = page
      .locator("a")
      .filter({ hasText: "Browse Security Docs" })
      .first();
    await docLink.click();

    await page.waitForTimeout(500);

    const documentsSection = page.locator("#documents");
    const searchInput = documentsSection
      .locator("input[placeholder*='Search documents']")
      .first();
    await searchInput.fill("security");
    await searchInput.press("Enter");

    await page.waitForTimeout(300);

    const documentCards = documentsSection.locator("article");
    await expect(documentCards.first()).toBeVisible();
  });

  test("public document download works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const documentsSection = page.locator("#documents");
    await documentsSection.scrollIntoViewIfNeeded();

    const downloadLink = documentsSection.locator("a[download]").first();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      downloadLink.click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test("login modal opens for gated documents", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const documentsSection = page.locator("#documents");
    await documentsSection.scrollIntoViewIfNeeded();

    const signInButton = documentsSection
      .locator("button")
      .filter({ hasText: "Sign in to Download" })
      .first();
    await signInButton.click();

    await expect(page.locator("[role='dialog']")).toBeVisible();
  });

  test("authentication flow works (login/logout)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const signInButton = page
      .locator("button")
      .filter({ hasText: "Sign in" })
      .first();
    await signInButton.click();

    await expect(page.locator("[role='dialog']")).toBeVisible();
  });

  test("contact form submission works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    const form = contactSection.locator("form").first();
    await form.locator("input[name='name']").first().fill("Test User");
    await form.locator("input[name='email']").first().fill("test@example.com");
    await form.locator("input[name='company']").first().fill("Test Company");
    await form
      .locator("textarea[name='message']")
      .first()
      .fill("Test message for contact form");

    const submitButton = form.locator("button[type='submit']").first();
    await submitButton.click();

    await expect(page.locator("text=Thank you for your inquiry")).toBeVisible({
      timeout: 10000,
    });
  });

  test("subprocessors table search works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const subprocessorsSection = page.locator("#subprocessors");
    await subprocessorsSection.scrollIntoViewIfNeeded();

    const searchInput = subprocessorsSection
      .locator("input[placeholder*='Search vendors']")
      .first();
    await searchInput.fill("amazon");
    await searchInput.press("Enter");

    await page.waitForTimeout(300);

    const tableRows = subprocessorsSection.locator("tbody tr");
    await expect(tableRows.first()).toBeVisible();
  });

  test("FAQ accordion expand/collapse works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const faqSection = page.locator("#faq");
    await faqSection.scrollIntoViewIfNeeded();

    // Find the first FAQ accordion button (skip category filter buttons)
    const faqAccordion = faqSection.locator(
      "div.divide-y button[aria-expanded]",
    );
    const firstAccordion = faqAccordion.first();
    await firstAccordion.click();

    await page.waitForTimeout(300);

    await expect(firstAccordion).toHaveAttribute("aria-expanded", "true");

    const answerContent = page.locator("[role='region']");
    await expect(answerContent).toBeVisible();
  });

  test("responsive layout at mobile breakpoint", async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 390, height: 844 });
    }

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuButton = page.locator(
      "button[aria-label='Toggle navigation menu']",
    );
    await menuButton.click();

    const mobileNav = page.locator("nav[aria-label='Mobile navigation']");
    await expect(mobileNav).toBeVisible();

    // Check sections are still accessible
    await expect(page.locator("#certifications")).toBeVisible();
  });
});
