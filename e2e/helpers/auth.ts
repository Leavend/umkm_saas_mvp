// Test authentication helper - bypasses Google OAuth for E2E testing

import { test as base } from "@playwright/test";

/**
 * Create authenticated test context
 * Uses session cookies instead of OAuth flow
 */
export const test = base.extend({
  // Override context to inject auth cookies
  context: async ({ context }, use) => {
    // Set mock auth cookies
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "test-session-token-for-e2e",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await use(context);
  },
});

export { expect } from "@playwright/test";

/**
 * Helper to setup test user in database
 * Call this in test setup to create a test user
 */
export async function setupTestUser() {
  // This would use Prisma to create a test user
  // For now, we'll rely on middleware to handle test session
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    credits: 100,
  };
}

/**
 * Helper to clean up test data
 */
export async function cleanupTestData() {
  // Clean up test user and data after tests
  // Implementation would use Prisma
}
