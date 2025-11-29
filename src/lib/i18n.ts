// src/lib/i18n.ts
// Main i18n configuration and helper functions

import { en } from "./i18n/en";
import { id } from "./i18n/id";

export const SUPPORTED_LOCALES = ["en", "id"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LANGUAGE_STORAGE_KEY = "umkm-saas-language";

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function assertValidLocale(value: string): asserts value is Locale {
  if (!isSupportedLocale(value)) {
    throw new Error(
      `Invalid locale: ${value}. Supported locales are: ${SUPPORTED_LOCALES.join(", ")}`,
    );
  }
}

export function normalizeLocale(
  value: unknown,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (isSupportedLocale(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();

    const exactMatch = SUPPORTED_LOCALES.find(
      (locale) => locale.toLowerCase() === normalized,
    );
    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = SUPPORTED_LOCALES.find((locale) =>
      normalized.startsWith(locale.toLowerCase()),
    );
    if (partialMatch) {
      return partialMatch;
    }
  }

  return fallback;
}

// Import translations from modular files
export const TRANSLATIONS = {
  en,
  id,
} as const;

export type Translations = (typeof TRANSLATIONS)[Locale];
export type TranslationNamespace = keyof Translations;

export function formatTranslation(
  template: string,
  replacements?: Record<string, string | number>,
): string {
  if (!replacements) {
    return template;
  }

  return template.replace(/{(\w+)}/g, (match, key) => {
    const replacement = replacements[key as keyof typeof replacements];
    return replacement !== undefined ? String(replacement) : match;
  });
}

/**
 * Server-side translation helper
 * Access nested translation keys using dot notation
 * Example: getServerTranslation('en', 'common.errors.authRequired')
 */
export function getServerTranslation(locale: Locale, key: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const keys = key.split(".");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = TRANSLATIONS[normalizedLocale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Fallback to key if translation not found
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}
