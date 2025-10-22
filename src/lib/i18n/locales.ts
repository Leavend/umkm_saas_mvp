// src/lib/i18n/locales.ts

export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";

export const LANGUAGE_STORAGE_KEY = "umkm-saas-language";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function normalizeLocale(value: unknown): Locale {
  if (isLocale(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.startsWith("id")) {
      return "id";
    }
  }

  return defaultLocale;
}
