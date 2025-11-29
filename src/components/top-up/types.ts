// Top-up modal shared types

import type { PRODUCT_CONFIG } from "~/lib/constants";

export type Product = ReturnType<typeof createProductConfig>;

export type ProductConfig =
  | typeof PRODUCT_CONFIG.SMALL
  | typeof PRODUCT_CONFIG.MEDIUM
  | typeof PRODUCT_CONFIG.LARGE;

export interface TopUpTranslations {
  title: string;
  header: string;
  fallbackTitle: string;
  tokenLabel: string;
  packages: {
    starterPack: string;
    growthPack: string;
    proPack: string;
  };
  totalTokens: string;
  save: string;
  badgeBestValueLabel: string;
  badgePopularLabel: string;
  purchaseCta: string;
  processing: string;
  paymentFailed: string;
  paymentProcessFailed: string;
  instant: string;
  bonus: string;
  safe: string;
  logout: string;
  logoutSuccess: string;
  logoutFailed: string;
}

// Helper functions
export const calculateDiscountPercentage = (
  original: number,
  current: number,
): number => Math.round(((original - current) / original) * 100);

export const createProductConfig = (
  baseProduct: ProductConfig,
  originalAmount: number,
) => ({
  ...baseProduct,
  originalAmount,
  amount: baseProduct.amount,
  discount: calculateDiscountPercentage(originalAmount, baseProduct.amount),
  totalCredits: baseProduct.credits + baseProduct.bonusCredits,
});
