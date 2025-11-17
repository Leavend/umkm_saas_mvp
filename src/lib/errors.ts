// src/lib/errors.ts

/**
 * Enhanced error handling system with specific error types and context
 */

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  requestId?: string;
  timestamp?: Date;
  additionalInfo?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly context: ErrorContext;

  constructor(message: string, context: ErrorContext = {}) {
    super(message);
    this.name = new.target.name;
    this.context = {
      timestamp: new Date(),
      ...context,
    };
  }

  /**
   * Convert error to a structured format for logging/monitoring
   */
  toLoggableObject() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      context: this.context,
      timestamp: this.context.timestamp?.toISOString(),
    };
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "You need to be logged in to perform this action",
    context: ErrorContext = {},
  ) {
    super(message, { operation: "unauthorized_access", ...context });
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    context: ErrorContext = {},
  ) {
    super(message, { operation: "validation", ...context });
    this.field = field;
    this.value = value;
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = "The requested resource was not found",
    resource?: string,
    id?: string,
    context: ErrorContext = {},
  ) {
    const fullMessage =
      resource && id ? `${resource} with id '${id}' was not found` : message;
    super(fullMessage, { operation: "not_found", ...context });
    this.resource = resource;
    this.id = id;
  }

  public readonly resource?: string;
  public readonly id?: string;
}

export class InsufficientCreditsError extends AppError {
  constructor(
    message = "Insufficient credits to perform this action",
    required?: number,
    available?: number,
    context: ErrorContext = {},
  ) {
    const fullMessage =
      required && available
        ? `Requires ${required} credits, but only ${available} available`
        : message;
    super(fullMessage, { operation: "insufficient_credits", ...context });
    this.required = required;
    this.available = available;
  }

  public readonly required?: number;
  public readonly available?: number;
}

export class NetworkError extends AppError {
  constructor(
    message = "Network request failed",
    status?: number,
    url?: string,
    context: ErrorContext = {},
  ) {
    const fullMessage =
      status && url ? `Network error: ${status} for ${url}` : message;
    super(fullMessage, { operation: "network_request", ...context });
    this.status = status;
    this.url = url;
  }

  public readonly status?: number;
  public readonly url?: string;
}

export class RateLimitError extends AppError {
  constructor(
    message = "Too many requests. Please try again later",
    resetTime?: Date,
    context: ErrorContext = {},
  ) {
    super(message, { operation: "rate_limit", ...context });
    this.resetTime = resetTime;
  }

  public readonly resetTime?: Date;
}

export class ConfigurationError extends AppError {
  constructor(
    message = "Configuration error",
    configKey?: string,
    context: ErrorContext = {},
  ) {
    const fullMessage = configKey
      ? `Configuration error: ${configKey} is missing or invalid`
      : message;
    super(fullMessage, { operation: "configuration", ...context });
    this.configKey = configKey;
  }

  public readonly configKey?: string;
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
      const obj = value as Record<string, unknown>;
      let message: string;
      if ("message" in obj && typeof obj.message === "string") {
        message = obj.message;
      } else if ("toString" in obj && typeof obj.toString === "function") {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        message = obj.toString();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        message = String(value);
      }
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
