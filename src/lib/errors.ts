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
