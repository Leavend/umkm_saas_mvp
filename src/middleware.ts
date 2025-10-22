// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match as localeMatcher } from "@formatjs/intl-localematcher";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  normalizeLocale,
} from "~/lib/i18n";
import { createLocalePath } from "~/lib/locale-path";

const locales = SUPPORTED_LOCALES;

function getLocale(request: NextRequest): string {
  const headers = {
    "accept-language": request.headers.get("accept-language") || "",
  };
  const languages = new Negotiator({ headers }).languages();

  try {
    const matched = localeMatcher(languages, locales, DEFAULT_LOCALE);
    return normalizeLocale(matched);
  } catch (e) {
    return DEFAULT_LOCALE;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }
  const locale = getLocale(request);
  const newPath = createLocalePath(locale, pathname);

  request.nextUrl.pathname = newPath;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};