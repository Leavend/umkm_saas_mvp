// @ts-ignore - Playwright types are not available in this environment yet.
import { test, expect } from "@playwright/test";

test.describe.skip("language switcher", () => {
  test("navigates between localized routes", async ({ page }) => {
    await page.goto("http://localhost:3000/en");
    await expect(page).toHaveURL(/\/en$/);
    await page.getByRole("button", { name: /Bahasa Indonesia|Language/i }).click();
    await expect(page).toHaveURL(/\/id$/);
    await page.click('a[href="/id/dasbor"]');
    await expect(page).toHaveURL(/\/id\/dasbor/);
  });
});
