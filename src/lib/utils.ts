// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BUSINESS_CONSTANTS } from "~/lib/constants/business";
import { ValidationError } from "~/lib/errors";

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  return BUSINESS_CONSTANTS.validation.emailPattern.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  if (typeof password !== "string") return false;

  const config = BUSINESS_CONSTANTS.validation.password;

  if (
    password.length < config.minLength ||
    password.length > config.maxLength
  ) {
    return false;
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (config.requireLowercase && !/[a-z]/.test(password)) return false;
  if (config.requireNumbers && !/\d/.test(password)) return false;
  if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return false;

  return true;
}

/**
 * Validate credit amount
 */
export function isValidCreditAmount(amount: unknown): boolean {
  if (typeof amount !== "number" || !Number.isInteger(amount)) return false;
  return (
    amount >= BUSINESS_CONSTANTS.credits.minAmount &&
    amount <= BUSINESS_CONSTANTS.credits.maxAmount
  );
}

/**
 * Validate credit delta (for deductions/additions)
 */
export function isValidCreditDelta(delta: unknown): boolean {
  if (typeof delta !== "number" || !Number.isInteger(delta) || delta === 0)
    return false;
  return Math.abs(delta) <= BUSINESS_CONSTANTS.credits.maxAmount;
}

/**
 * Validate string length
 */
export function isValidStringLength(
  value: unknown,
  min = 0,
  max = Infinity,
): boolean {
  if (typeof value !== "string") return false;
  return value.length >= min && value.length <= max;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a random ID
 */
export function generateId(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Note: deepClone function removed due to TypeScript complexity
// This function was causing type assertion issues and is not currently used
// If needed in the future, consider using a simpler approach or a library like lodash

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Get time ago in human readable format
 */
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extract error message from unknown error
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[],
): void {
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null) {
      throw new ValidationError(
        `Missing required field: ${String(field)}`,
        String(field),
        obj[field],
      );
    }
  }
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Sleep/delay function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
