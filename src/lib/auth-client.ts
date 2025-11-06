// src/lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";
import { env } from "~/env.js";

const shouldEnableGoogleOneTap = Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

const googleOneTapPlugin = shouldEnableGoogleOneTap
  ? oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      // Disable auto-select to prevent FedCM conflicts
      autoSelect: false,
      // Allow user to cancel by clicking outside
      cancelOnTapOutside: true,
      // Use signin context
      context: "signin",
    })
  : undefined;

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  // Use redirect flow to avoid popup conflicts with One Tap
  socialAuthFlow: "redirect",
  plugins: googleOneTapPlugin ? [googleOneTapPlugin] : [],
});

// Export hooks untuk digunakan di components
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export const isGoogleOneTapEnabled = Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
