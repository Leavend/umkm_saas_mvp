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
 * Triggers the Better Auth Google sign-in flow using redirect.
 *
 * This avoids popup conflicts with One Tap and uses the standard better-auth flow.
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
    // Use the standard better-auth social sign-in with redirect flow
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
