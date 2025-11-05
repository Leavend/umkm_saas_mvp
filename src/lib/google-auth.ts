// src/lib/google-auth.ts
"use client";

import { authClient } from "~/lib/auth-client";

interface GoogleSignInOptions {
  /**
   * Path that the user should land on after Google authentication completes.
   * This will be combined with the current window origin to produce an absolute URL.
   */
  callbackPath: string;
}

/**
 * Triggers the Better Auth Google sign-in flow in a popup window.
 *
 * The caller is responsible for handling any errors that might be thrown.
 */
export function initiateGoogleSignIn({
  callbackPath,
}: GoogleSignInOptions): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Google authentication can only be initiated in the browser.");
  }

  const callbackURL = new URL(callbackPath, window.location.origin).toString();

  try {
    return authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Unable to initiate Google authentication.");
  }
}
