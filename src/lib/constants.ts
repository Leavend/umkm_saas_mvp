// src/lib/constants.ts

/**
 * Product configuration constants
 * Central source of truth for all product-related data
 */
export const PRODUCT_CONFIG = {
  SMALL: {
    id: "b1683342-0ae2-472d-938c-0dbb305da157",
    credits: 10,
    amount: 10000, // in cents/IDR
    usdAmount: 1,
    name: "Starter Pack (10 credits)",
  },
  MEDIUM: {
    id: "4c253826-afe9-40d1-918e-28aef0447f27",
    credits: 30,
    amount: 30000,
    usdAmount: 3,
    name: "Growth Pack (30 credits)",
  },
  LARGE: {
    id: "3d8c0664-2fa3-4f82-a8d8-e9e56158aa22",
    credits: 100,
    amount: 100000,
    usdAmount: 10,
    name: "Pro Pack (100 credits)",
  },
} as const;

/**
 * Product utilities for easy access to specific data
 */
export const PRODUCT_UTILS = {
  /**
   * Get all product IDs as an array
   */
  getAllIds: (): string[] => Object.values(PRODUCT_CONFIG).map((p) => p.id),

  /**
   * Get product by ID
   */
  getById: (id: string) =>
    Object.values(PRODUCT_CONFIG).find((p) => p.id === id),

  /**
   * Get credits amount by product ID
   */
  getCreditsById: (id: string): number | null => {
    const product = PRODUCT_UTILS.getById(id);
    return product?.credits ?? null;
  },

  /**
   * Get all products as array
   */
  getAll: () => Object.values(PRODUCT_CONFIG),
} as const;

/**
 * UI Constants
 */
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 150,
  TOAST_DURATION: 4000,
  PAGINATION_LIMIT: 20,
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
} as const;
