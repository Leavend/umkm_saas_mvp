// src/server/auth/unified-session.ts

import type { GuestSession } from "@prisma/client";
import { getCurrentUserId } from "./session";
import { getGuestSessionCredentials } from "./guest-session";
import { validateGuestSessionCredentials } from "~/server/services/guest-session-service";

type SessionContext =
  | { type: "user"; userId: string; guestSession: null }
  | { type: "guest"; userId: null; guestSession: GuestSession }
  | { type: "none"; userId: null; guestSession: null };

/**
 * Efficiently resolves the current session context with proper validation.
 * Returns early on first successful authentication to avoid unnecessary calls.
 */
export async function getSessionContext(): Promise<SessionContext> {
  // Check authenticated user first (most common case)
  const userId = await getCurrentUserId();
  if (userId) {
    return { type: "user", userId, guestSession: null };
  }

  // Only check guest if no authenticated user
  const guestCredentials = await getGuestSessionCredentials();
  if (!guestCredentials.sessionId) {
    return { type: "none", userId: null, guestSession: null };
  }

  try {
    const guestSession =
      await validateGuestSessionCredentials(guestCredentials);
    return { type: "guest", userId: null, guestSession };
  } catch {
    return { type: "none", userId: null, guestSession: null };
  }
}

/**
 * Enforces that a valid session exists, throwing if none found.
 */
export async function requireSessionContext(): Promise<
  Exclude<SessionContext, { type: "none" }>
> {
  const context = await getSessionContext();

  if (context.type === "none") {
    throw new Error(
      "Authentication required: Please sign in or continue as guest",
    );
  }

  return context;
}
