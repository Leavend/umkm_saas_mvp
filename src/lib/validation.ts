// Form validation utilities

import { BUSINESS_CONSTANTS } from "~/lib/constants/business";
import { ValidationError } from "~/lib/errors";

// ===========================
// VALIDATION FUNCTIONS
// ===========================

/**
 * Validate email format
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  if (!BUSINESS_CONSTANTS.validation.emailPattern.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  const config = BUSINESS_CONSTANTS.validation.password;

  if (password.length < config.minLength) {
    return {
      valid: false,
      error: `Password must be at least ${config.minLength} characters`,
    };
  }

  if (password.length > config.maxLength) {
    return {
      valid: false,
      error: `Password must not exceed ${config.maxLength} characters`,
    };
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (config.requireNumbers && !/\d/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }

  if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one special character",
    };
  }

  return { valid: true };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: unknown,
  fieldName = "Field",
): { valid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName = "Field",
): { valid: boolean; error?: string } {
  if (typeof value !== "string") {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  if (value.length < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min} characters`,
    };
  }

  if (value.length > max) {
    return {
      valid: false,
      error: `${fieldName} must not exceed ${max} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate number range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName = "Value",
): { valid: boolean; error?: string } {
  if (typeof value !== "number" || isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (value > max) {
    return { valid: false, error: `${fieldName} must not exceed ${max}` };
  }

  return { valid: true };
}

// ===========================
// FORM VALIDATION HELPERS
// ===========================

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export type ValidationRule<T> = {
  field: keyof T;
  validate: (value: unknown) => { valid: boolean; error?: string };
};

/**
 * Validate form data with multiple rules
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: ValidationRule<T>[],
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const rule of rules) {
    const result = rule.validate(data[rule.field]);
    if (!result.valid && result.error) {
      errors[rule.field as string] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Throw ValidationError if validation fails
 */
export function assertValid(
  result: { valid: boolean; error?: string },
  field: string,
  value: unknown,
): void {
  if (!result.valid && result.error) {
    throw new ValidationError(result.error, field, value);
  }
}
