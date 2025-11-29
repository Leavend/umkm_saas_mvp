// Shared constants and utilities for guest session service

import { randomBytes } from "node:crypto";

// Constants
export const INITIAL_GUEST_CREDITS = 10;
export const DAILY_CREDIT_AMOUNT = 1;
export const DAILY_CREDIT_CAP = 10;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ACCESS_TOKEN_BYTES = 32;
export const SESSION_SECRET_BYTES = 32;
export const FINGERPRINT_BYTES = 16;

export const GUEST_SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);

// Generator functions
export const generateHex = (bytes: number): string =>
  randomBytes(bytes).toString("hex");

export const generateAccessToken = (): string =>
  generateHex(ACCESS_TOKEN_BYTES);

export const generateSessionSecret = (): string =>
  generateHex(SESSION_SECRET_BYTES);

export const generateFingerprint = (): string => generateHex(FINGERPRINT_BYTES);

// Date utilities
export const getStartOfUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

export const computeExpiry = (): Date => new Date(Date.now() + SESSION_TTL_MS);
