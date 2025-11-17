/**
 * Business logic constants for consistent values across the application
 */

import { AUTH_CONFIG } from "~/lib/auth-config";

export const BUSINESS_CONSTANTS = {
  /**
   * Credit system configuration
   */
  credits: {
    initialGuest: AUTH_CONFIG.credits.initialGuest,
    dailyAmount: AUTH_CONFIG.credits.dailyAmount,
    dailyCap: AUTH_CONFIG.credits.dailyCap,
    minAmount: 1,
    maxAmount: 1000,
  },

  /**
   * Session and authentication constants
   */
  auth: {
    sessionTTL: AUTH_CONFIG.session.ttlMs,
    googleScope: AUTH_CONFIG.google.scope,
    googlePrompt: AUTH_CONFIG.google.prompt,
    googleAccessType: AUTH_CONFIG.google.accessType,
    maxSessionAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    cookieMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  },

  /**
   * API and request constants
   */
  api: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    requestTimeout: 30000, // 30 seconds
    maxPayloadSize: "10MB",
  },

  /**
   * File upload and image constants
   */
  media: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    imageQuality: 80,
    thumbnailSize: { width: 400, height: 300 },
    fullSize: { width: 1200, height: 900 },
  },

  /**
   * Prompt and content constants
   */
  content: {
    maxPromptLength: 1000,
    minPromptLength: 10,
    maxTitleLength: 100,
    minTitleLength: 3,
    maxCategoryLength: 30,
    searchMinLength: 2,
    searchMaxLength: 100,
  },

  /**
   * Pagination constants
   */
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },

  /**
   * Validation constants
   */
  validation: {
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
  },

  /**
   * Rate limiting constants
   */
  rateLimit: {
    apiCallsPerMinute: 60,
    imageGenerationPerDay: 100,
    searchQueriesPerMinute: 30,
  },

  /**
   * Environment configuration
   */
  environment: {
    development: process.env.NODE_ENV === "development",
    production: process.env.NODE_ENV === "production",
    test: process.env.NODE_ENV === "test",
  },

  /**
   * Feature flags
   */
  features: {
    enableGuestMode: true,
    enableSocialLogin: true,
    enableCreditSystem: true,
    enableImageGeneration: true,
    enableMarketplace: true,
    enableAnalytics: false,
    enableBetaFeatures: false,
  },
} as const;

// Type exports for better type safety
export type CreditAmount = typeof BUSINESS_CONSTANTS.credits;
export type AuthConstants = typeof BUSINESS_CONSTANTS.auth;
export type ApiConstants = typeof BUSINESS_CONSTANTS.api;
export type MediaConstants = typeof BUSINESS_CONSTANTS.media;
export type ContentConstants = typeof BUSINESS_CONSTANTS.content;
export type PaginationConstants = typeof BUSINESS_CONSTANTS.pagination;
export type ValidationConstants = typeof BUSINESS_CONSTANTS.validation;
export type RateLimitConstants = typeof BUSINESS_CONSTANTS.rateLimit;
