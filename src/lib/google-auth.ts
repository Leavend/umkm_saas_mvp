// src/lib/google-auth.ts
"use client";

import { authClient } from "~/lib/auth-client";

interface GoogleSignInOptions {
  /**
   * Path that the user should land on after Google authentication completes.
   * This will be combined with the current window origin to produce an absolute URL.
   */
  redirectTo: string;
}

/**
 * Triggers the Better Auth Google sign-in flow using popup.
 *
 * This provides a better UX by keeping the user on the site without full page redirects.
 */
export async function initiateGoogleSignIn({
  redirectTo,
}: GoogleSignInOptions): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error(
      "Google authentication can only be initiated in the browser.",
    );
  }

  try {
    // Use the popup flow for better UX
    await authClient.signIn.social({
      provider: "google",
      callbackURL: new URL(redirectTo, window.location.origin).toString(),
    });
  } catch (error) {
    // Handle any authentication errors
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred during Google authentication.";

    throw new Error(errorMessage);
  }
}
