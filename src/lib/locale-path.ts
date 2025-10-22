// src/lib/locale-path.ts

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "~/lib/i18n";

const LOCALE_PATTERN = new RegExp(
  `^/(?:${SUPPORTED_LOCALES.join("|")})(?=/|$)`,
  "i",
);

function ensureLeadingSlash(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

export function extractLocaleFromPath(pathname: string): Locale | null {
  const match = pathname.match(LOCALE_PATTERN);
  if (!match) {
    return null;
  }

  const locale = match[0].slice(1).toLowerCase();
  return SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : null;
}

export function stripLocaleFromPath(pathname: string): string {
  const normalized = pathname || "/";
  const match = normalized.match(LOCALE_PATTERN);

  if (!match) {
    return normalized;
  }

  const stripped = normalized.slice(match[0].length) || "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function createLocalePath(locale: Locale, href: string): string {
  if (!href) {
    return `/${locale}`;
  }

  if (!href.startsWith("/")) {
    return href;
  }

  const sanitizedHref = ensureLeadingSlash(href);
  const pathWithoutLocale = stripLocaleFromPath(sanitizedHref);

  if (pathWithoutLocale === "/") {
    return `/${locale}`;
  }

  return `/${locale}${pathWithoutLocale}`;
}

export function ensureLocaleInPath(
  pathname: string,
  fallback: Locale = DEFAULT_LOCALE,
): { locale: Locale; pathname: string } {
  const detected = extractLocaleFromPath(pathname) ?? fallback;
  const normalizedPath = createLocalePath(detected, pathname);

  return {
    locale: detected,
    pathname: normalizedPath,
  };
}
