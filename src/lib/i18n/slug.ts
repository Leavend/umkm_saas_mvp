// src/lib/i18n/slug.ts

import type { Locale } from "./locales";

export type LocalizedSlugRecord = {
  id: string;
  slug_en: string;
  slug_id: string;
};

export function pickSlug(record: LocalizedSlugRecord, locale: Locale) {
  return locale === "id" ? record.slug_id : record.slug_en;
}

export function invertSlugMap(records: LocalizedSlugRecord[], locale: Locale) {
  const map = new Map<string, LocalizedSlugRecord>();

  for (const record of records) {
    map.set(locale === "id" ? record.slug_id : record.slug_en, record);
  }

  return map;
}
