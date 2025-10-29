// src/lib/constants.ts

export const PRODUCT_IDS = {
  SMALL: "b1683342-0ae2-472d-938c-0dbb305da157",
  MEDIUM: "4c253826-afe9-40d1-918e-28aef0447f27",
  LARGE: "3d8c0664-2fa3-4f82-a8d8-e9e56158aa22",
};

export const CREDITS_MAP = {
  [PRODUCT_IDS.SMALL]: 10,
  [PRODUCT_IDS.MEDIUM]: 30,
  [PRODUCT_IDS.LARGE]: 100,
};

export const PRODUCT_AMOUNTS = {
  [PRODUCT_IDS.SMALL]: 10000,
  [PRODUCT_IDS.MEDIUM]: 30000,
  [PRODUCT_IDS.LARGE]: 100000,
};

export const PRODUCT_AMOUNTS_USD = {
  [PRODUCT_IDS.SMALL]: 1,
  [PRODUCT_IDS.MEDIUM]: 3,
  [PRODUCT_IDS.LARGE]: 10,
};

export const PRODUCT_NAMES = {
  [PRODUCT_IDS.SMALL]: "Starter Pack (10 credits)",
  [PRODUCT_IDS.MEDIUM]: "Growth Pack (30 credits)",
  [PRODUCT_IDS.LARGE]: "Pro Pack (100 credits)",
};
