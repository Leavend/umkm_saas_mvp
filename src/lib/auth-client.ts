"use client";

import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";
import { env } from "~/env.js";

const isBrowser = typeof window !== "undefined";
const isProduction = process.env.NODE_ENV === "production";

const normalizeOrigin = (origin: string) => {
  try {
    return new URL(origin).origin;
  } catch {
    return origin;
  }
};

const parseAllowedOrigins = (origins: string | undefined) =>
  origins
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin) ?? [];

const allowedGoogleOrigins = parseAllowedOrigins(
  env.NEXT_PUBLIC_GOOGLE_ONE_TAP_ALLOWED_ORIGINS,
);

const isOriginAllowedForOneTap = () => {
  if (!isBrowser) {
    return false;
  }

  if (allowedGoogleOrigins.length === 0) {
    return isProduction;
  }

  return allowedGoogleOrigins.includes(window.location.origin);
};

const shouldEnableGoogleOneTap =
  Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) && isOriginAllowedForOneTap();

const googleOneTapPlugin =
  shouldEnableGoogleOneTap && env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ? oneTapClient({
        clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        allowedParentOrigin:
          allowedGoogleOrigins.length > 0 ? allowedGoogleOrigins : undefined,
        autoSelect: false,
        cancelOnTapOutside: true,
        context: "signin",
        promptOptions: {
          baseDelay: 1000,
          maxAttempts: 5,
        },
      })
    : undefined;

if (
  isBrowser &&
  !shouldEnableGoogleOneTap &&
  env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
  process.env.NODE_ENV !== "production"
) {
  const disabledReason =
    allowedGoogleOrigins.length > 0
      ? `current origin "${window.location.origin}" is not in NEXT_PUBLIC_GOOGLE_ONE_TAP_ALLOWED_ORIGINS`
      : "Google One Tap is disabled outside production";

  console.info(`[auth] Google One Tap disabled: ${disabledReason}.`);
}

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  socialAuthFlow: "popup",
  plugins: googleOneTapPlugin ? [googleOneTapPlugin] : [],
});

// Export hooks untuk digunakan di components
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export const isGoogleOneTapEnabled = shouldEnableGoogleOneTap;
