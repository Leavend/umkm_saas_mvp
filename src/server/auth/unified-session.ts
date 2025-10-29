// src/server/auth/unified-session.ts

import { getCurrentUserId } from "./session";
import { getGuestSessionId } from "./guest-session";

export async function getCurrentUserOrGuest() {
  const userId = await getCurrentUserId();
  const guestSessionId = await getGuestSessionId();

  return {
    userId,
    guestSessionId,
    isGuest: !userId && !!guestSessionId,
    isAuthenticated: !!userId,
  };
}

export async function requireUserOrGuest() {
  const { userId, guestSessionId } = await getCurrentUserOrGuest();

  if (!userId && !guestSessionId) {
    throw new Error(
      "Authentication required: either user session or guest session needed",
    );
  }

  return { userId, guestSessionId };
}
