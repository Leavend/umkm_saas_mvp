// src/lib/i18n/dictionary.ts

import "server-only";
import type { Locale } from "./i18n";
import { TRANSLATIONS } from "./i18n";

// Fungsi ini HANYA akan berjalan di server
export const getDictionary = (locale: Locale) => {
  return TRANSLATIONS[locale];
};