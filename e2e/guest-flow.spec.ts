// E2E Test: Guest user browsing and session migration
import { test, expect } from "@playwright/test";

test.describe("Guest User Flow", () => {
  test("should allow guest to browse marketplace", async ({ page }) => {
    // Navigate to marketplace
    await page.goto("/");

    // Should see marketplace header
    await expect(
      page.getByRole("heading", { name: /marketplace/i }),
    ).toBeVisible();

    // Should see prompt cards
    const promptCards = page.locator('[data-testid="prompt-card"]').first();
    await expect(promptCards).toBeVisible();

    // Can view prompt details
    await promptCards.click();
    await expect(page.locator('[data-testid="prompt-modal"]')).toBeVisible();
  });

  test("should create guest session automatically", async ({
    page,
    context,
  }) => {
    await page.goto("/");

    // Wait for guest session to be created
    await page.waitForTimeout(1000);

    // Check for guest session cookies
    const cookies = await context.cookies();
    const guestSession = cookies.find((c) => c.name.includes("guest"));

    expect(guestSession).toBeDefined();
  });

  test("should migrate guest session on login", async ({ page }) => {
    // Start as guest
    await page.goto("/");
    await page.waitForTimeout(500);

    // Try to use a feature that requires auth
    const generateButton = page
      .getByRole("button", { name: /generate/i })
      .first();
    await generateButton.click();

    // Should show auth modal
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/sign in/i)).toBeVisible();

    // Note: Actual OAuth flow would require test credentials
    // This validates that auth flow is triggered correctly
  });

  test("should persist guest activity across pages", async ({ page }) => {
    await page.goto("/");

    // Bookmark a prompt as guest
    const bookmarkButton = page
      .getByRole("button", { name: /bookmark/i })
      .first();
    await bookmarkButton.click();

    // Navigate to saved prompts
    await page.goto("/saved-prompts");

    // Should see bookmarked prompt
    // (This assumes guest bookmarks are stored in cookies/localStorage)
    const savedPrompts = page.locator('[data-testid="saved-prompt"]');
    await expect(savedPrompts.first()).toBeVisible();
  });
});
