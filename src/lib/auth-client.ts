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
