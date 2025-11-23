// src/proxy.ts
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

// Fungsi helper untuk mendapatkan locale
function getLocale(request: NextRequest): Locale {
  // 1. Cek Cookie
  const cookieLocale = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Cek Header Browser
  const negotiator = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") ?? "",
    },
  });

  const languages = negotiator.languages();
  const matchedLocale = localeMatcher(
    languages,
    [...SUPPORTED_LOCALES],
    DEFAULT_LOCALE,
  );

  return isSupportedLocale(matchedLocale) ? matchedLocale : DEFAULT_LOCALE;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Catatan: Logika shouldBypassPath dihapus karena sudah ditangani oleh config.matcher di bawah.

  const pathnameLocale = pathname.split("/")[1];
  const existingCookie = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;

  // KASUS 1: URL sudah memiliki locale (misal: /en/about)
  if (isSupportedLocale(pathnameLocale)) {
    // Jika cookie beda dengan URL, sinkronkan cookie dengan URL
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

  // KASUS 2: URL tidak memiliki locale (misal: /about) -> Redirect
  const locale = getLocale(request);
  const url = request.nextUrl.clone();

  // Pastikan pathname bersih agar tidak double slash
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url, 307); // Gunakan 307 untuk preserve method
  response.cookies.set(LANGUAGE_STORAGE_KEY, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  // Matcher ini sudah cukup kuat untuk memfilter file statis
  matcher: ["/((?!_next|api|favicon.ico|\\.well-known|.*\\..*).*)"],
};
