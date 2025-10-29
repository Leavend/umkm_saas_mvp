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
    return new Error(JSON.stringify(value));
  } catch (serializationError) {
    return new Error(String(serializationError));
  }
};

export const getErrorMessage = (value: unknown): string =>
  toError(value).message;

export const logError = (context: string, value: unknown) => {
  console.error(context, toError(value));
};
