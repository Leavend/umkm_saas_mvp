// src/lib/errors.ts

export class AppError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ValidationError extends AppError {}

export class NotFoundError extends AppError {}

export class InsufficientCreditsError extends AppError {
  constructor(message = "Insufficient credits") {
    super(message);
  }
}

export const toError = (value: unknown): Error => {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === "string") {
    return new Error(value);
  }

  try {
    // Handle circular references in objects
    return new Error(JSON.stringify(value, getCircularReplacer()));
  } catch {
    // If JSON.stringify fails, try to extract a meaningful message
    if (value && typeof value === "object") {
      // Try to get message property if it exists
      const message = (value as any).message || (value as any).toString?.() || String(value);
      return new Error(message);
    }
    return new Error(String(value));
  }
};

// Helper function to handle circular references
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: unknown) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular Reference]";
      }
      seen.add(value);
    }
    return value;
  };
};

export const getErrorMessage = (value: unknown): string =>
  toError(value).message;

export const logError = (context: string, value: unknown) => {
  const error = toError(value);
  console.error(`${context}: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
};
