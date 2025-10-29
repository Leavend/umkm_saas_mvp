// src/components/sidebar/credits.tsx

import { CreditsDisplay } from "~/components/sidebar/credits-display";
import { getCurrentUserId } from "~/server/auth/session";
import { getGuestSessionCredentials } from "~/server/auth/guest-session";
import { ensureDailyCreditForUser } from "~/server/services/user-service";
import {
  ensureDailyCreditForGuest,
  validateGuestSessionCredentials,
} from "~/server/services/guest-session-service";
import { AppError, logError } from "~/lib/errors";

export default async function Credits() {
  try {
    const userId = await getCurrentUserId();

    if (userId) {
      const { credits } = await ensureDailyCreditForUser(userId);
      return <CreditsDisplay credits={credits} />;
    }

    const guestCredentials = await getGuestSessionCredentials();

    if (guestCredentials.sessionId) {
      try {
        const guestSession =
          await validateGuestSessionCredentials(guestCredentials);
        const { credits } = await ensureDailyCreditForGuest(guestSession.id);
        return <CreditsDisplay credits={credits} />;
      } catch (error: unknown) {
        if (error instanceof AppError) {
          console.warn("Guest session unavailable for credits", error.message);
        } else {
          logError("Failed to resolve guest credits", error);
        }
      }
    }
  } catch (error: unknown) {
    logError("Credits component failed", error);
  }

  return <CreditsDisplay credits={0} />;
}
