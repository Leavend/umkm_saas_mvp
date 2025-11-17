// src/lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { env } from "~/env.js";

/**
 * Centralized authentication client configuration
 * Provides consistent auth behavior across the application
 */
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  // Use redirect flow - will be handled differently for mobile vs desktop
  // Desktop: popup window with custom modal
  // Mobile: direct redirect (new tab)
  socialAuthFlow: "redirect",
  plugins: [],
});

// Export hooks for type-safe usage in components
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

/**
 * Feature flag for Google One Tap integration
 */
export const isGoogleOneTapEnabled = Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

/**
 * Detect if user is on mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};
