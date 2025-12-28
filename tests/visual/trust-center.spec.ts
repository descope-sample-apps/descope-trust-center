import { expect, test } from "@playwright/test";

test.describe("Trust Center Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("full page screenshot", async ({ page }) => {
    await expect(page).toHaveScreenshot("trust-center-full-page.png", {
      fullPage: true,
    });
  });

  test("hero section", async ({ page }) => {
    const hero = page.locator("section").first();
    await expect(hero).toHaveScreenshot("hero-section.png");
  });

  test("certifications section", async ({ page }) => {
    const certifications = page.locator("#certifications").first();
    await certifications.scrollIntoViewIfNeeded();
    await expect(certifications).toHaveScreenshot("certifications-section.png");
  });

  test("subprocessors section", async ({ page }) => {
    const subprocessors = page.locator("#subprocessors").first();
    await subprocessors.scrollIntoViewIfNeeded();
    await expect(subprocessors).toHaveScreenshot("subprocessors-list.png");
  });

  test("faq section", async ({ page }) => {
    const faq = page.locator("#faq").first();
    await faq.scrollIntoViewIfNeeded();
    await expect(faq).toHaveScreenshot("faq-section.png");
  });

  test("contact form section", async ({ page }) => {
    const contact = page.locator("#contact").first();
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toHaveScreenshot("contact-form.png");
  });

  test("header navigation", async ({ page }) => {
    const header = page.getByRole("banner");
    await expect(header).toHaveScreenshot("header.png");
  });

  test("footer", async ({ page }) => {
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveScreenshot("footer.png");
  });
});

test.describe("Interactive States", () => {
  test("faq accordion expanded", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const faq = page.locator("#faq").first();
    await faq.scrollIntoViewIfNeeded();

    const firstAccordionTrigger = faq.locator("button").first();
    if ((await firstAccordionTrigger.count()) > 0) {
      await firstAccordionTrigger.click();
      await page.waitForTimeout(300);
    }

    await expect(faq).toHaveScreenshot("faq-expanded.png");
  });

  test("contact form focus state", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const contact = page.locator("#contact").first();
    await contact.scrollIntoViewIfNeeded();

    const firstInput = contact.locator("input").first();
    if ((await firstInput.count()) > 0) {
      await firstInput.focus();
    }

    await expect(contact).toHaveScreenshot("contact-form-focus.png");
  });
});
