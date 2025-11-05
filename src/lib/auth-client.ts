"use client";

import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";
import { env } from "~/env.js";

const shouldEnableGoogleOneTap = Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

const googleOneTapPlugin = shouldEnableGoogleOneTap
  ? oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
      // FedCM compatibility - tambahkan useFedCM flag
      additionalOptions: {
        useFedCM: true,
        // Disable deprecated UI status methods yang menyebabkan warning
        disabledUiStatusMethods: ["display_moment", "skipped_moment"],
      },
      promptOptions: {
        baseDelay: 1000,
        maxAttempts: 5,
      },
    })
  : undefined;

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  socialAuthFlow: "popup",
  plugins: googleOneTapPlugin ? [googleOneTapPlugin] : [],
});

// Export hooks untuk digunakan di components
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export const isGoogleOneTapEnabled = Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
