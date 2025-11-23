// src/server/auth/guest-session.ts

import { cookies } from "next/headers";

import { findValidGuestSession } from "~/server/repositories/guest-repository";
import {
  validateGuestSessionCredentials,
  type GuestSessionCredentials,
} from "~/server/services/guest-session-service";

export const GUEST_SESSION_COOKIE = "guest_session_id";
export const GUEST_ACCESS_TOKEN_COOKIE = "guest-access-token";
export const GUEST_SESSION_SECRET_COOKIE = "session-secret";
export const GUEST_FINGERPRINT_COOKIE = "fingerprint";

type HeaderLike = {
  get(name: string): string | null | undefined;
};

const getCookieValue = (cookieHeader: string, name: string): string | null => {
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [cookieName, ...rest] = pair.trim().split("=");
    if (cookieName === name) {
      return rest.length > 0 ? decodeURIComponent(rest.join("=")) : "";
    }
  }

  return null;
};

export async function getGuestSessionCredentials(
  headerSource?: string | HeaderLike | null,
): Promise<GuestSessionCredentials> {
  if (typeof headerSource === "string") {
    return {
      sessionId: getCookieValue(headerSource, GUEST_SESSION_COOKIE),
      accessToken: getCookieValue(headerSource, GUEST_ACCESS_TOKEN_COOKIE),
      sessionSecret: getCookieValue(headerSource, GUEST_SESSION_SECRET_COOKIE),
      fingerprint: getCookieValue(headerSource, GUEST_FINGERPRINT_COOKIE),
    };
  }

  if (
    headerSource &&
    typeof headerSource === "object" &&
    "get" in headerSource
  ) {
    const headerValue = headerSource.get("cookie") ?? "";
    return {
      sessionId: getCookieValue(headerValue, GUEST_SESSION_COOKIE),
      accessToken: getCookieValue(headerValue, GUEST_ACCESS_TOKEN_COOKIE),
      sessionSecret: getCookieValue(headerValue, GUEST_SESSION_SECRET_COOKIE),
      fingerprint: getCookieValue(headerValue, GUEST_FINGERPRINT_COOKIE),
    };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(GUEST_SESSION_COOKIE);
  const accessTokenCookie = cookieStore.get(GUEST_ACCESS_TOKEN_COOKIE);
  const sessionSecretCookie = cookieStore.get(GUEST_SESSION_SECRET_COOKIE);
  const fingerprintCookie = cookieStore.get(GUEST_FINGERPRINT_COOKIE);

  return {
    sessionId: sessionCookie?.value ?? null,
    accessToken: accessTokenCookie?.value ?? null,
    sessionSecret: sessionSecretCookie?.value ?? null,
    fingerprint: fingerprintCookie?.value ?? null,
  };
}

export async function getGuestSessionId(
  headerSource?: string | HeaderLike | null,
): Promise<string | null> {
  const { sessionId } = await getGuestSessionCredentials(headerSource);
  return sessionId ?? null;
}

export async function getValidGuestSession() {
  const guestSessionId = await getGuestSessionId();
  if (!guestSessionId) {
    return null;
  }

  return findValidGuestSessionById(guestSessionId);
}

export async function getValidatedGuestSession(
  headerSource?: string | HeaderLike | null,
) {
  const credentials = await getGuestSessionCredentials(headerSource);

  try {
    return await validateGuestSessionCredentials(credentials);
  } catch {
    return null;
  }
}

export async function findValidGuestSessionById(id: string) {
  const session = await findValidGuestSession(id);
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session;
}

export async function getCurrentUserIdOrGuestId() {
  // This will be used to get either authenticated user ID or guest session ID
  // For now, we'll implement the guest part
  const guestSessionId = await getGuestSessionId();
  return { userId: null, guestSessionId };
}
