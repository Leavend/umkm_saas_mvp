// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: resolveBaseUrl(),
});

// Export hooks untuk digunakan di components
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
