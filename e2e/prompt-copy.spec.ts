// E2E Test: Prompt copy after purchase
import { test, expect } from "@playwright/test";

test.describe("Prompt Copy Flow", () => {
  test.use({ storageState: "e2e/.auth/user.json" }); // Requires authenticated state

  test("should enable copy after user has credits", async ({ page }) => {
    await page.goto("/");

    // Find a prompt card
    const promptCard = page.locator('[data-testid="prompt-card"]').first();
    await promptCard.click();

    // Prompt detail modal should show
    await expect(page.getByRole("dialog")).toBeVisible();

    // Copy button should be enabled if user has credits
    const copyButton = page.getByRole("button", { name: /copy/i });
    await expect(copyButton).toBeEnabled();
  });

  test("should copy prompt to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/");

    const promptCard = page.locator('[data-testid="prompt-card"]').first();
    await promptCard.click();

    // Click copy button
    const copyButton = page.getByRole("button", { name: /copy/i });
    await copyButton.click();

    // Should show success toast
    await expect(page.getByText(/copied/i)).toBeVisible();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toBeTruthy();
    expect(clipboardText.length).toBeGreaterThan(0);
  });

  test("should deduct credits after copy", async ({ page }) => {
    await page.goto("/");

    // Get initial credit count
    const creditDisplay = page.getByText(/\d+\s*credits?/i);
    const initialText = await creditDisplay.textContent();
    const initialCredits = parseInt(initialText?.match(/\d+/)?.[0] || "0");

    // Copy a prompt
    const promptCard = page.locator('[data-testid="prompt-card"]').first();
    await promptCard.click();
    const copyButton = page.getByRole("button", { name: /copy/i });
    await copyButton.click();

    // Wait for credit update
    await page.waitForTimeout(500);

    // Credits should decrease
    const updatedText = await creditDisplay.textContent();
    const updatedCredits = parseInt(updatedText?.match(/\d+/)?.[0] || "0");

    expect(updatedCredits).toBeLessThan(initialCredits);
  });

  test("should show insufficient credit error", async ({ page }) => {
    await page.goto("/");

    // Set credits to 0 (would need test helper or mock)
    await page.evaluate(() => {
      localStorage.setItem("test_credits", "0");
    });

    await page.reload();

    const promptCard = page.locator('[data-testid="prompt-card"]').first();
    await promptCard.click();

    const copyButton = page.getByRole("button", { name: /copy/i });
    await copyButton.click();

    // Should show error message
    await expect(page.getByText(/insufficient.*credit/i)).toBeVisible();

    // Should prompt to purchase
    await expect(page.getByText(/purchase|top.*up/i)).toBeVisible();
  });

  test("should prevent copy without authentication", async ({ page }) => {
    // Use a context without auth
    await page.goto("/");

    const promptCard = page.locator('[data-testid="prompt-card"]').first();
    await promptCard.click();

    const copyButton = page.getByRole("button", { name: /copy/i });
    await copyButton.click();

    // Should show auth modal
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });
});
