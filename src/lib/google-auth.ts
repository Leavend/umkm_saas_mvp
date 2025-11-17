// src/lib/google-auth.ts
"use client";

import { authClient } from "~/lib/auth-client";

interface GoogleSignInOptions {
  redirectTo: string;
}

export async function initiateGoogleSignIn({
  redirectTo,
}: GoogleSignInOptions): Promise<void> {
  if (typeof window === "undefined")
    throw new Error(
      "Google authentication can only be initiated in the browser.",
    );

  try {
    // Use better-auth's signIn function for Google OAuth with popup flow
    await authClient.signIn.social({
      provider: "google",
      callbackURL: redirectTo,
    });

    // Force session refresh after successful auth
    setTimeout(() => {
      if (typeof window !== "undefined") {
        void (async () => {
          try {
            const { getSession } = await import("~/lib/auth-client");
            await getSession();
            // Trigger a page reload to ensure UI updates
            window.location.reload();
          } catch (error) {
            console.error("Failed to refresh session:", error);
            // Still reload the page as fallback
            window.location.reload();
          }
        })();
      }
    }, 1000);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Google authentication failed";

    if (errorMessage.includes("popup") && errorMessage.includes("diblokir")) {
      throw new Error("Popup diblokir. Silakan izinkan popup untuk situs ini.");
    } else if (errorMessage.includes("ditutup oleh pengguna")) {
      throw new Error("Autentikasi dibatalkan oleh pengguna.");
    } else if (errorMessage.includes("timeout")) {
      throw new Error("Autentikasi timeout (5 menit)");
    } else {
      throw new Error(errorMessage);
    }
  }
}

/**
 * Exchange an ID token (from GIS) with your backend to create a session.
 * This function is deprecated as better-auth handles this automatically.
 */
export async function _exchangeGoogleIdToken(
  _credential: string,
  _redirectTo: string,
): Promise<void> {
  // This is no longer needed with better-auth
  console.warn("exchangeGoogleIdToken is deprecated. Use better-auth instead.");
  return Promise.resolve();
}
