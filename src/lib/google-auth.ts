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
    throw new Error(
      "Google authentication can only be initiated in the browser.",
    );
  }

  const callbackURL = new URL(callbackPath, window.location.origin).toString();
  const width = 500;
  const height = 650;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  const popup = window.open(
    "about:blank",
    "better-auth-google",
    `popup,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`,
  );

  if (!popup) {
    throw new Error(
      "Popup diblokir oleh browser. Izinkan popup untuk melanjutkan proses masuk dengan Google.",
    );
  }

  try {
    popup.focus();

    return (
      authClient.signIn.social as unknown as (options: {
        provider: string;
        callbackURL: string;
        mode?: "popup";
        openedWindow?: Window | null;
      }) => Promise<void>
    )({
      provider: "google",
      callbackURL,
      mode: "popup",
      openedWindow: popup,
    });
  } catch (error) {
    if (!popup.closed) {
      popup.close();
    }
    // Always create a clean error object to avoid circular references
    if (error instanceof Error) {
      // Create a new error with just the message to avoid circular references
      throw new Error(error.message || "Unable to initiate Google authentication.");
    } else {
      throw new Error("Unable to initiate Google authentication.");
    }
  }
}
