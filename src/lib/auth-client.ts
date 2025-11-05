// src/lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";
import { env } from "~/env.js"; // <-- Import env

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL, // <-- Use directly from env
  socialAuthFlow: "popup",
});

// Export hooks untuk digunakan di components
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
