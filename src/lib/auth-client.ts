// src/lib/auth-client.ts
"use client";

/**
 * NextAuth client utilities
 * This file is kept for backward compatibility but now uses NextAuth
 */

export { useSession, signIn, signOut } from "next-auth/react";

/**
 * Feature flag for Google One Tap integration
 */
export const isGoogleOneTapEnabled = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
);

/**
 * Detect if user is on mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};
