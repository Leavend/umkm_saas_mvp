import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  Locale,
  normalizeLocale,
} from "~/lib/i18n";

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

export function getRequestLocale(): Locale {
  const cookieStore = cookies();
  const storedLocale = cookieStore.get(LANGUAGE_STORAGE_KEY)?.value;
  if (storedLocale) {
    return normalizeLocale(storedLocale);
  }

  const headerLocale = parseAcceptLanguage(headers().get("accept-language"));
  if (headerLocale) {
    return headerLocale;
  }

  return DEFAULT_LOCALE;
}
