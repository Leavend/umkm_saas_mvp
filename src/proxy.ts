// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match as localeMatcher } from "@formatjs/intl-localematcher";

import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "./lib/i18n";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Helper: Get locale from cookie or browser headers
function getLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;
  if (isSupportedLocale(cookieLocale)) return cookieLocale;

  const negotiator = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") ?? "",
    },
  });

  const matchedLocale = localeMatcher(
    negotiator.languages(),
    [...SUPPORTED_LOCALES],
    DEFAULT_LOCALE,
  );

  return isSupportedLocale(matchedLocale) ? matchedLocale : DEFAULT_LOCALE;
}

// Helper: Handle requests that already have a locale
function handleLocaleRequest(
  request: NextRequest,
  locale: Locale,
): NextResponse {
  const existingCookie = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;

  if (locale !== existingCookie) {
    const response = NextResponse.next();
    response.cookies.set(LANGUAGE_STORAGE_KEY, locale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

// Helper: Handle requests missing a locale (redirect)
function handleMissingLocale(request: NextRequest): NextResponse {
  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;

  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url, 307);
  response.cookies.set(LANGUAGE_STORAGE_KEY, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  return response;
}

// Main middleware function
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameLocale = pathname.split("/")[1];

  // Check if the path starts with a supported locale
  if (isSupportedLocale(pathnameLocale)) {
    return handleLocaleRequest(request, pathnameLocale);
  }

  return handleMissingLocale(request);
}

export const config = {
  // Expanded matcher to exclude more static files and system paths
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.css|.*\\.js|\\.well-known).*)",
  ],
};
