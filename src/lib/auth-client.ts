// src/lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { env } from "~/env.js";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  // Use popup flow for better UX, avoiding full page redirects
  socialAuthFlow: "popup",
  plugins: [],
});

// Export hooks untuk digunakan di components
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export const isGoogleOneTapEnabled = Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
