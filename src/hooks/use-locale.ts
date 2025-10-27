// src/hooks/use-locale.ts

"use client";

import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "~/lib/i18n";

export function useLocale(): Locale {
  const params = useParams<{ lang?: string }>();
  return normalizeLocale(params?.lang, DEFAULT_LOCALE);
}
