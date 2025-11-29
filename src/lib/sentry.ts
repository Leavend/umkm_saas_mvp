// Sentry instrumentation helpers

import * as Sentry from "@sentry/nextjs";

/**
 * Wrap server action with Sentry instrumentation
 * Automatically captures errors and performance metrics
 */
export function withSentryServerAction<
  T extends (...args: never[]) => Promise<unknown>,
>(actionName: string, action: T): T {
  return (async (...args: Parameters<T>) => {
    return await Sentry.startSpan(
      {
        name: actionName,
        op: "server.action",
      },
      async () => {
        try {
          return await action(...args);
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              action: actionName,
            },
          });
          throw error;
        }
      },
    );
  }) as T;
}

/**
 * Wrap async operation with Sentry tracing
 */
export async function withSentryTracing<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: operationName,
      op: "function",
    },
    async (span) => {
      if (metadata) {
        span.setAttributes(metadata as any);
      }

      try {
        return await operation();
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            operation: operationName,
          },
          extra: metadata,
        });
        throw error;
      }
    },
  );
}

/**
 * Capture error with context
 */
export function captureError(
  error: unknown,
  context: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id?: string; email?: string };
  } = {},
): void {
  Sentry.captureException(error, context);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string | null;
  name?: string | null;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email ?? undefined,
    username: user.name ?? undefined,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}
