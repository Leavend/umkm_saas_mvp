// src/lib/constants.ts

/**
 * Product configuration constants
 * Central source of truth for all product-related data
 */
export const PRODUCT_CONFIG = {
  SMALL: {
    id: "b1683342-0ae2-472d-938c-0dbb305da157",
    credits: 11,
    bonusCredits: 2,
    amount: 19000, // Rp 19.000
    usdAmount: 2, // $2
    name: "Starter Pack",
    badge: null,
  },
  MEDIUM: {
    id: "4c253826-afe9-40d1-918e-28aef0447f27",
    credits: 24,
    bonusCredits: 11,
    amount: 39000, // Rp 39.000
    usdAmount: 4, // $4
    name: "Growth Pack",
    badge: "Hemat 24%",
    badgeVariant: "popular",
  },
  LARGE: {
    id: "3d8c0664-2fa3-4f82-a8d8-e9e56158aa22",
    credits: 59,
    bonusCredits: 36,
    amount: 89000, // Rp 89.000
    usdAmount: 9, // $9
    name: "Pro Pack",
    badge: "7x Lebih Banyak", // atau "Paling Untung"
    badgeVariant: "best-value",
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
    if (!product) return null;
    return product.credits + (product.bonusCredits ?? 0);
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
