// User credit read operations

import { db } from "~/server/db";
import { logError } from "~/lib/errors";
import { validateUserId, type CreditSnapshot } from "./utils";

/**
 * Fetch user credit snapshot
 * @param userId - User ID
 * @returns Credit snapshot or null if not found
 */
export const fetchUserCreditSnapshot = (
  userId: string,
): Promise<CreditSnapshot | null> =>
  db.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      lastDailyCreditAt: true,
    },
  });

/**
 * Get current user credits without updating
 * @param userId - User ID to get credits for
 * @returns Current credits amount or null if user not found
 */
export async function getUserCredits(userId: string): Promise<number | null> {
  try {
    validateUserId(userId);

    const user = await fetchUserCreditSnapshot(userId);
    return user?.credits ?? null;
  } catch (error) {
    logError("getUserCredits", { userId, error });

    // Re-throw validation errors
    throw error;
  }
}
