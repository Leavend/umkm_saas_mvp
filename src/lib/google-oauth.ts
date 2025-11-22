// src/lib/google-oauth.ts

/**
 * Google OAuth URL construction utilities
 * Builds OAuth URLs manually for custom popup/redirect behavior
 */

import { env } from "~/env.js";

interface GoogleOAuthParams {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scopes?: string[];
  prompt?: "select_account" | "consent" | "none";
}

/**
 * Construct Google OAuth authorization URL
 * @param params OAuth parameters
 * @returns Complete OAuth URL ready to open
 */
export function buildGoogleOAuthUrl(params: GoogleOAuthParams): string {
  const {
    clientId,
    redirectUri,
    state,
    codeChallenge,
    scopes = ["openid", "email", "profile"],
    prompt = "select_account",
  } = params;

  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const queryParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: prompt,
    access_type: "offline",
  });

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Get Google OAuth configuration
 */
export function getGoogleOAuthConfig() {
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured");
  }

  const baseURL =
    env.NEXTAUTH_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const redirectUri = `${baseURL}/api/auth/callback/google`;

  return {
    clientId,
    redirectUri,
  };
}
