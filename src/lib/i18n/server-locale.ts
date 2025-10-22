// src/lib/i18n/server-locale.ts

import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  type Locale,
  normalizeLocale,
} from "~/lib/i18n/i18n";

function parseAcceptLanguage(headerValue: string | null): Locale | null {
  if (!headerValue) {
    return null;
  }

  const locales = headerValue
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .filter(Boolean);

  if (locales.length === 0) {
    return null;
  }

  return normalizeLocale(locales[0]);
}

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(LANGUAGE_STORAGE_KEY)?.value;
  if (storedLocale) {
    return normalizeLocale(storedLocale);
  }

  const requestHeaders = await headers();
  const headerLocale = parseAcceptLanguage(
    requestHeaders.get("accept-language"),
  );
  if (headerLocale) {
    return headerLocale;
  }

  return DEFAULT_LOCALE;
}
