// src/lib/result.ts

import type { AppError } from "./errors";

export type Result<TValue, TError = AppError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export const ok = <TValue>(value: TValue): Result<TValue, never> => ({
  ok: true,
  value,
});

export const err = <TError>(error: TError): Result<never, TError> => ({
  ok: false,
  error,
});

export const mapError = <TValue, TError, TMappedError>(
  result: Result<TValue, TError>,
  mapper: (error: TError) => TMappedError,
): Result<TValue, TMappedError> => {
  if (result.ok) {
    return result;
  }

  return err(mapper(result.error));
};

export const unwrapOr = <TValue, TError>(
  result: Result<TValue, TError>,
  fallback: TValue,
): TValue => (result.ok ? result.value : fallback);
