export const AUTH_CONFIG = {
  google: {
    scope: ["openid", "email", "profile"],
    prompt: "select_account consent" as const,
    accessType: "offline" as const,
  },
  credits: {
    initialGuest: 10,
    dailyAmount: 1,
    dailyCap: 10,
  },
  session: {
    ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
