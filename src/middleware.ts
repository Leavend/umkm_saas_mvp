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
const STATIC_PATH_PREFIXES = [
  "/api/",
  "/_next/static/",
  "/_next/image/",
  "/.well-known/",
  "/auth-trigger",
  "/auth-success",
  "/auth-error",
];
const STATIC_FILE_EXTENSIONS = [
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webmanifest",
];

function shouldBypassPath(pathname: string): boolean {
  if (STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return STATIC_FILE_EXTENSIONS.some((extension) =>
    pathname.endsWith(extension),
  );
}

function getLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const negotiator = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") ?? "",
    },
  });

  const languages = negotiator.languages();
  if (!languages || languages.length === 0) {
    return DEFAULT_LOCALE;
  }

  const matchedLocale = localeMatcher(
    languages,
    [...SUPPORTED_LOCALES],
    DEFAULT_LOCALE,
  );

  return isSupportedLocale(matchedLocale) ? matchedLocale : DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypassPath(pathname)) {
    return NextResponse.next();
  }

  const pathnameLocale = pathname.split("/")[1];
  const existingCookie = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;

  if (isSupportedLocale(pathnameLocale)) {
    if (pathnameLocale !== existingCookie) {
      const response = NextResponse.next();
      response.cookies.set(LANGUAGE_STORAGE_KEY, pathnameLocale, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
      return response;
    }

    return NextResponse.next();
  }

  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url, 307);
  response.cookies.set(LANGUAGE_STORAGE_KEY, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next|api/|favicon.ico|\\.well-known|.*\\..*).*)"],
};
