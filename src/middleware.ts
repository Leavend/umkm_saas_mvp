// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match as localeMatcher } from "@formatjs/intl-localematcher";

import {
  LANGUAGE_STORAGE_KEY,
  DEFAULT_LOCALE as i18nDefault,
  SUPPORTED_LOCALES as locales,
} from "./lib/i18n";

const defaultLocale = "id";

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    console.log(`Middleware: Ditemukan locale dari cookie: ${cookieLocale}`);
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  const headers = { "accept-language": acceptLanguage || "" };
  let languages: string[] = [];
  try {
    languages = new Negotiator({ headers }).languages() || [];
  } catch (e) {
    console.error("Middleware: Gagal parse header Accept-Language:", e);
  }

  try {
    const supportedLocalesArray = Array.isArray(locales) ? locales : [locales];
    const defaultLocaleString =
      typeof defaultLocale === "string" ? defaultLocale : i18nDefault;

    if (languages.length === 0) {
      console.log(
        `Middleware: Tidak ada bahasa di header, gunakan default: ${defaultLocaleString}`,
      );
      return defaultLocaleString;
    }

    const matchedLocale = localeMatcher(
      languages,
      supportedLocalesArray,
      defaultLocaleString,
    );
    console.log(
      `Middleware: Locale cocok dari header/default: ${matchedLocale}`,
    );
    return matchedLocale;
  } catch (e) {
    console.error("Middleware: Gagal mencocokkan locale:", e);
    console.log(
      `Middleware: Gagal cocok, gunakan default locale: ${defaultLocale}`,
    );
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/_next/image/") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webmanifest")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getLocale(request);
  const newPathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const redirectUrl = new URL(newPathname, request.url);

  console.log(
    `Middleware: Redirecting dari ${pathname} ke ${redirectUrl.pathname}`,
  );
  return NextResponse.redirect(redirectUrl, 307);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
