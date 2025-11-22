// src/server/auth/session.ts

import { auth } from "~/lib/auth";
import { UnauthorizedError } from "~/lib/errors";

/**
 * Get the current session from NextAuth
 * Returns null if not authenticated
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Get the current user ID from session
 * Returns null if not authenticated
 */
export async function getCurrentUserId() {
  const session = await getServerSession();

  return session?.user?.id ?? null;
}

/**
 * Require authentication and return user ID
 * Throws UnauthorizedError if not authenticated
 */
export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}
