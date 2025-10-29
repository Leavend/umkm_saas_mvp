// src/components/sidebar/credits.tsx

import { CreditsDisplay } from "~/components/sidebar/credits-display";
import { getSessionContext } from "~/server/auth/unified-session";
import { ensureDailyCreditForUser } from "~/server/services/user-service";
import { ensureDailyCreditForGuest } from "~/server/services/guest-session-service";
import { logError } from "~/lib/errors";

export default async function Credits() {
  try {
    const context = await getSessionContext();

    if (context.type === "user") {
      const { credits } = await ensureDailyCreditForUser(context.userId);
      return <CreditsDisplay credits={credits} />;
    }

    if (context.type === "guest") {
      const { credits } = await ensureDailyCreditForGuest(
        context.guestSession.id,
      );
      return <CreditsDisplay credits={credits} />;
    }
  } catch (error: unknown) {
    logError("Credits component failed", error);
  }

  return <CreditsDisplay credits={0} />;
}
