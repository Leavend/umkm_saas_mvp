// src/lib/routing.ts

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./i18n";

const LOCALE_PREFIXES = SUPPORTED_LOCALES.map((locale) => `/${locale}`);

export const stripLocaleFromPathname = (
  pathname: string,
  locale: Locale = DEFAULT_LOCALE,
): string => {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  const normalizedLocale = LOCALE_PREFIXES.includes(`/${locale}`)
    ? locale
    : DEFAULT_LOCALE;

  const localePrefix = `/${normalizedLocale}`;

  if (pathname === localePrefix) {
    return "/";
  }

  if (pathname.startsWith(`${localePrefix}/`)) {
    return pathname.slice(localePrefix.length);
  }

  return pathname;
};
