// Shared utilities and validation for user service

import { BUSINESS_CONSTANTS } from "~/lib/constants/business";
import { ValidationError } from "~/lib/errors";
import { isValidCreditAmount } from "~/lib/utils";

// Types
export interface DailyCreditResult {
  credits: number;
  granted: boolean;
  lastDailyCreditAt: Date | null;
}

export type CreditSnapshot = Pick<
  DailyCreditResult,
  "credits" | "lastDailyCreditAt"
>;

// Date utilities
export function getStartOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

// Validation functions
export function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    throw new ValidationError("User ID is required", "userId", userId);
  }
}

export function validateCreditAmount(amount: number): void {
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
