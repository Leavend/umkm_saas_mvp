// src/lib/routing.ts

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./i18n";

const LOCALE_PREFIXES = SUPPORTED_LOCALES.map((locale) => `/${locale}`);

const ensureLeadingSlash = (path: string): string =>
  path.startsWith("/") ? path : `/${path}`;

const hasLocalePrefix = (path: string): boolean => {
  if (!path) {
    return false;
  }

  const normalized = ensureLeadingSlash(path);

  return SUPPORTED_LOCALES.some(
    (locale) =>
      normalized === `/${locale}` || normalized.startsWith(`/${locale}/`),
  );
};

export const addLocalePrefixToPath = (path: string, locale: Locale): string => {
  if (!path || path === "/") {
    return `/${locale}`;
  }

  if (hasLocalePrefix(path)) {
    return ensureLeadingSlash(path);
  }

  const normalized = ensureLeadingSlash(path);
  return `/${locale}${normalized}`;
};

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
