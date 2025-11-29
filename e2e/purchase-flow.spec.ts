// E2E Test: Credit purchase flow
import { test, expect } from "@playwright/test";

test.describe("Credit Purchase Flow", () => {
  test.use({ storageState: "e2e/.auth/user.json" }); // Requires authenticated state

  test("should display top-up modal", async ({ page }) => {
    await page.goto("/");

    // Click credits/top-up button
    const topUpButton = page.getByRole("button", { name: /top.*up|credits/i });
    await topUpButton.click();

    // Modal should appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/package|select.*plan/i)).toBeVisible();
  });

  test("should show available credit packages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /top.*up|credits/i }).click();

    // Should see 3 packages
    const packages = page.locator('[data-testid="credit-package"]');
    await expect(packages).toHaveCount(3);

    // Should show prices
    await expect(page.getByText(/rp.*29/i)).toBeVisible(); // Starter pack
    await expect(page.getByText(/rp.*49/i)).toBeVisible(); // Growth pack
    await expect(page.getByText(/rp.*99/i)).toBeVisible(); // Pro pack
  });

  test("should initiate purchase flow", async ({ page, context }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /top.*up|credits/i }).click();

    // Click on a package purchase button
    const purchaseButton = page
      .getByRole("button", { name: /purchase|buy/i })
      .first();

    // Listen for new page (Xendit payment page)
    const pagePromise = context.waitForEvent("page");
    await purchaseButton.click();
    const paymentPage = await pagePromise;

    // Should redirect to Xendit
    await expect(paymentPage).toHaveURL(/xendit\.co/i);
  });

  test("should update credits after successful payment", async ({ page }) => {
    // Note: This test would require mocking Xendit callback
    // or using test payment credentials

    await page.goto("/");

    // Get current credit count
    const creditDisplay = page.getByText(/\d+\s*credits?/i);
    const initialCredits = await creditDisplay.textContent();

    // Simulate successful payment callback
    // (In real scenario, this would come from Xendit webhook)
    await page.evaluate(() => {
      localStorage.setItem("test_payment_success", "true");
    });

    await page.reload();

    // Credits should have increased
    // (This is a simplified test - actual implementation would vary)
    const updatedCredits = await creditDisplay.textContent();
    expect(updatedCredits).not.toBe(initialCredits);
  });
});
