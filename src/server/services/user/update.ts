// User credit deduction (specialized update) operations

import {
  NotFoundError,
  InsufficientCreditsError,
  logError,
} from "~/lib/errors";
import { extractErrorMessage } from "~/lib/utils";
import { db } from "~/server/db";
import { validateUserId, validateCreditAmount } from "./utils";

/**
 * Deduct credits from a user account
 * @param userId - User ID to deduct credits from
 * @param amount - Amount of credits to deduct
 * @returns Updated credits amount
 */
export async function deductCredits(
  userId: string,
  amount: number,
): Promise<number> {
  try {
    validateUserId(userId);
    validateCreditAmount(amount);

    const result = await db.$transaction(async (tx) => {
      // Check current credits
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user) {
        throw new NotFoundError("User not found", "user", userId);
      }

      if (user.credits < amount) {
        throw new InsufficientCreditsError(
          `Insufficient credits. Required: ${amount}, Available: ${user.credits}`,
          amount,
          user.credits,
          { userId },
        );
      }

      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } },
        select: { credits: true },
      });

      return updatedUser.credits;
    });

    return result;
  } catch (error) {
    logError("deduct Credits", { userId, amount, error });

    if (
      error instanceof NotFoundError ||
      error instanceof InsufficientCreditsError
    ) {
      throw error;
    }

    throw new Error(`Failed to deduct credits: ${extractErrorMessage(error)}`);
  }
}
