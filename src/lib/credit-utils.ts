/**
 * Shared credit system utilities
 * Centralized credit calculation and validation logic
 */

import { AUTH_CONFIG } from "~/lib/auth-config";

export const DAILY_CREDIT_AMOUNT = AUTH_CONFIG.credits.dailyAmount;
export const DAILY_CREDIT_CAP = AUTH_CONFIG.credits.dailyCap;
export const INITIAL_GUEST_CREDITS = AUTH_CONFIG.credits.initialGuest;

/**
 * Get start of UTC day for credit reset logic
 */
export const getStartOfUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

/**
 * Check if enough time has passed for daily credit reset
 */
export const isDailyCreditEligible = (
  lastCreditDate: Date | null,
  now: Date = new Date(),
): boolean => {
  if (lastCreditDate === null) return true;
  return lastCreditDate < getStartOfUtcDay(now);
};

/**
 * Calculate new credit amount after earning daily credits
 */
export const calculateNewCredits = (
  currentCredits: number,
  dailyAmount: number = DAILY_CREDIT_AMOUNT,
  cap: number = DAILY_CREDIT_CAP,
): number => {
  return Math.min(currentCredits + dailyAmount, cap);
};

/**
 * Validate credit amount
 */
export const isValidCreditAmount = (amount: unknown): boolean => {
  if (typeof amount !== "number") return false;
  return Number.isInteger(amount) && amount > 0;
};

/**
 * Validate credit delta (for deductions/additions)
 */
export const isValidCreditDelta = (delta: unknown): boolean => {
  if (typeof delta !== "number") return false;
  return Number.isInteger(delta) && delta !== 0;
};
