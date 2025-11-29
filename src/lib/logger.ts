// Structured logging with Pino

import pino from "pino";

/**
 * Create production-ready logger with proper configuration
 */
export const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),

  // Development: pretty print
  // Production: JSON for log aggregation
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,

  // Base context
  base: {
    env: process.env.NODE_ENV,
    service: "ai-image-editor",
  },

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Don't log in test environment
  enabled: process.env.NODE_ENV !== "test",
});

/**
 * Create child logger with additional context
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log levels:
 * - fatal: Application crashed
 * - error: Error that needs attention
 * - warn: Warning, might need attention
 * - info: General information
 * - debug: Debugging information
 * - trace: Very detailed debugging
 */

// Convenience methods with typed context
export const log = {
  /**
   * Fatal error - application crashed
   */
  fatal(message: string, error?: Error, context?: Record<string, unknown>) {
    logger.fatal({ err: error, ...context }, message);
  },

  /**
   * Error - something went wrong
   */
  error(message: string, error?: Error, context?: Record<string, unknown>) {
    logger.error({ err: error, ...context }, message);
  },

  /**
   * Warning - might need attention
   */
  warn(message: string, context?: Record<string, unknown>) {
    logger.warn(context, message);
  },

  /**
   * Info - general information
   */
  info(message: string, context?: Record<string, unknown>) {
    logger.info(context, message);
  },

  /**
   * Debug - debugging information
   */
  debug(message: string, context?: Record<string, unknown>) {
    logger.debug(context, message);
  },

  /**
   * Trace - very detailed debugging
   */
  trace(message: string, context?: Record<string, unknown>) {
    logger.trace(context, message);
  },
};

// Export default logger
export default logger;
