// User credit create/update operations

import { Prisma } from "@prisma/client";
import { BUSINESS_CONSTANTS } from "~/lib/constants/business";
import { NotFoundError, logError } from "~/lib/errors";
import { extractErrorMessage } from "~/lib/utils";
import { db } from "~/server/db";
import {
  validateUserId,
  validateCreditAmount,
  getStartOfUtcDay,
  type DailyCreditResult,
  type CreditSnapshot,
} from "./utils";

/**
 * Ensure daily credit for a user with proper validation
 * @param userId - User ID to grant credits to
 * @param amount - Amount of credits to grant (defaults to daily amount)
 * @returns Result of the credit operation
 */
export async function ensureDailyCreditForUser(
  userId: string,
  amount: number = BUSINESS_CONSTANTS.credits.dailyAmount,
): Promise<DailyCreditResult> {
  try {
    // Validate inputs
    validateUserId(userId);
    validateCreditAmount(amount);

    const now = new Date();
    const startOfToday = getStartOfUtcDay(now);
    const DAILY_CREDIT_AMOUNT = amount;
    const DAILY_CREDIT_CAP = BUSINESS_CONSTANTS.credits.dailyCap;

    // Use transaction for data consistency
    const result = await db.$transaction(async (tx) => {
      // First check if user exists
      const userExists = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        throw new NotFoundError("User not found", "user", userId);
      }

      // Attempt to update user's credits
      const updatedRows = await tx.$queryRaw<CreditSnapshot[]>(
        Prisma.sql`
          UPDATE "user"
          SET "credits" = LEAST("credits" + ${DAILY_CREDIT_AMOUNT}, ${DAILY_CREDIT_CAP}),
              "lastDailyCreditAt" = ${now}
          WHERE "id" = ${userId}
            AND "credits" < ${DAILY_CREDIT_CAP}
            AND (
              "lastDailyCreditAt" IS NULL
              OR "lastDailyCreditAt" < ${startOfToday}
            )
          RETURNING "credits", "lastDailyCreditAt"
        `,
      );

      const [updatedUser] = updatedRows;

      if (updatedUser) {
        return {
          credits: updatedUser.credits,
          granted: true,
          lastDailyCreditAt: updatedUser.lastDailyCreditAt,
        };
      }

      // User wasn't updated, fetch current state
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
        select: {
          credits: true,
          lastDailyCreditAt: true,
        },
      });

      if (!existingUser) {
        throw new NotFoundError(
          "User not found while fetching current state",
          "user",
          userId,
        );
      }

      return {
        credits: existingUser.credits,
        granted: false,
        lastDailyCreditAt: existingUser.lastDailyCreditAt,
      };
    });

    return result;
  } catch (error) {
    logError("ensureDailyCreditForUser", { userId, amount, error });
    throw error instanceof NotFoundError
      ? error
      : new Error(
          `Failed to ensure daily credit for user: ${extractErrorMessage(error)}`,
        );
  }
}

/**
 * Add credits to a user account
 * @param userId - User ID to add credits to
 * @param amount - Amount of credits to add
 * @returns Updated credits amount
 */
export async function addCredits(
  userId: string,
  amount: number,
): Promise<number> {
  try {
    validateUserId(userId);
    validateCreditAmount(amount);

    const result = await db.$transaction(async (tx) => {
      // Check if user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user) {
        throw new NotFoundError("User not found", "user", userId);
      }

      // Add credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
        select: { credits: true },
      });

      return updatedUser.credits;
    });

    return result;
  } catch (error) {
    logError("addCredits", { userId, amount, error });
    throw error instanceof NotFoundError
      ? error
      : new Error(`Failed to add credits: ${extractErrorMessage(error)}`);
  }
}
