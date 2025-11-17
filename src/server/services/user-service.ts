// src/server/services/user-service.ts

import { Prisma } from "@prisma/client";
import { BUSINESS_CONSTANTS } from "~/lib/constants/business";
import {
  ValidationError,
  NotFoundError,
  InsufficientCreditsError,
  logError,
} from "~/lib/errors";
import { isValidCreditAmount, extractErrorMessage } from "~/lib/utils";

import { db } from "~/server/db";

/**
 * Get start of UTC day for credit reset logic
 */
function getStartOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

interface DailyCreditResult {
  credits: number;
  granted: boolean;
  lastDailyCreditAt: Date | null;
}

type CreditSnapshot = Pick<DailyCreditResult, "credits" | "lastDailyCreditAt">;

/**
 * Validate user ID format
 * Note: better-auth uses a different ID format than standard UUIDs
 * So we just validate that it's a non-empty string
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    throw new ValidationError("User ID is required", "userId", userId);
  }

  // Accept any non-empty string as user ID (better-auth compatibility)
  // If specific format validation is needed, it should be added based on actual usage
}

/**
 * Validate credit amount with business rules
 */
function validateCreditAmount(amount: number): void {
  if (!isValidCreditAmount(amount)) {
    throw new ValidationError(
      "Credit amount must be a positive integer within valid range",
      "amount",
      amount,
    );
  }

  if (amount > BUSINESS_CONSTANTS.credits.maxAmount) {
    throw new ValidationError(
      `Credit amount cannot exceed ${BUSINESS_CONSTANTS.credits.maxAmount}`,
      "amount",
      amount,
    );
  }
}

const fetchUserCreditSnapshot = (
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
 * Ensure daily credit for a user with proper validation and error handling
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
    // Log the error with context
    logError("ensureDailyCreditForUser", {
      userId,
      amount,
      error,
    });

    // Re-throw known errors, wrap unknown ones
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof InsufficientCreditsError
    ) {
      throw error;
    }

    throw new Error(
      `Failed to ensure daily credit for user: ${extractErrorMessage(error)}`,
    );
  }
}

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

    if (error instanceof ValidationError) {
      throw error;
    }

    return null;
  }
}

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
    logError("deductCredits", { userId, amount, error });

    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof InsufficientCreditsError
    ) {
      throw error;
    }

    throw new Error(`Failed to deduct credits: ${extractErrorMessage(error)}`);
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

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }

    throw new Error(`Failed to add credits: ${extractErrorMessage(error)}`);
  }
}
