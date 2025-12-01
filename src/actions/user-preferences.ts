// Server action to update user email opt-in preference
"use server";

import { db } from "~/server/db";
import { getServerAuthSession } from "~/lib/auth";
import { logger } from "~/lib/logger";
import { captureError } from "~/lib/sentry";

export async function updateEmailOptIn(optIn: boolean) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: false, error: "Not authenticated" };

    await db.user.update({
      where: { id: userId },
      data: { emailOptIn: optIn },
    });

    logger.info({ msg: "Email opt-in updated", userId, optIn });
    return { success: true };
  } catch (error) {
    logger.error({ msg: "Update email opt-in failed", err: error });
    captureError(error, { tags: { action: "updateEmailOptIn" } });
    return { success: false, error: "Update failed" };
  }
}

async function getAuthenticatedUserId() {
  const session = await getServerAuthSession();
  return session?.user?.id;
}
