/**
 * Authentication configuration constants
 * Central source of truth for all auth-related settings
 */
export const AUTH_CONFIG = {
  /**
   * Google OAuth configuration
   */
  google: {
    scope: ["openid", "email", "profile"] as string[],
    prompt: "select_account consent" as const,
    accessType: "offline" as const,
  },

  /**
   * Credits system configuration
   */
  credits: {
    initialGuest: 10,
    dailyAmount: 1,
    dailyCap: 10,
  },

  /**
   * Session configuration
   */
  session: {
    ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
} as const;
