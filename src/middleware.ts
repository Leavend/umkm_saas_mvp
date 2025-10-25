// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match as localeMatcher } from "@formatjs/intl-localematcher";

import {
  LANGUAGE_STORAGE_KEY,
  DEFAULT_LOCALE as i18nDefault,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "./lib/i18n";

const defaultLocale: Locale = "id";

// Fungsi getLocale sudah baik, pastikan ia mengembalikan tipe Locale
function getLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;

  // Prioritaskan cookie jika valid
  if (isSupportedLocale(cookieLocale)) {
    console.log(`Middleware: Found valid locale from cookie: ${cookieLocale}`);
    return cookieLocale;
  }
  console.log(`Middleware: No valid cookie locale found (value: ${cookieLocale})`);

  // Jika tidak ada cookie, coba header
  const acceptLanguage = request.headers.get("accept-language");
  const headers = { "accept-language": acceptLanguage ?? "" };
  let languages: string[] = [];

  try {
    languages = new Negotiator({ headers }).languages() ?? [];
  } catch (e) {
    console.error("Middleware: Failed to parse Accept-Language header:", e);
  }

  try {
    const supportedLocalesArray = [...SUPPORTED_LOCALES];
    const defaultLocaleString =
      typeof defaultLocale === "string" ? defaultLocale : i18nDefault;

    if (languages.length === 0) {
      console.log(
        `Middleware: No languages in header, using default: ${defaultLocaleString}`,
      );
      // Pastikan defaultLocaleString adalah Locale
      return isSupportedLocale(defaultLocaleString) ? defaultLocaleString : 'id';
    }

    const matchedLocale = localeMatcher(
      languages,
      supportedLocalesArray,
      defaultLocaleString,
    );
    console.log(
      `Middleware: Matched locale from header/default: ${matchedLocale}`,
    );
    // Pastikan hasil matcher adalah Locale
     return isSupportedLocale(matchedLocale) ? matchedLocale : 'id';
  } catch (e) {
    console.error("Middleware: Failed to match locale:", e);
    console.log(
      `Middleware: Match failed, falling back to default locale: ${defaultLocale}`,
    );
    return defaultLocale; // Fallback ke default 'id'
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const currentCookie = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;

  console.log(`Middleware: Processing request for ${pathname}. Current cookie: ${currentCookie}`);

  // Skip middleware for static files and API routes
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
    console.log(`Middleware: Skipping API/static route: ${pathname}`);
    return NextResponse.next();
  }

  // Check if pathname already has a supported locale prefix
  const pathnameLocale = pathname.split('/')[1];
  const pathnameHasValidLocale = isSupportedLocale(pathnameLocale);


  if (pathnameHasValidLocale) {
     console.log(`Middleware: Path already has locale: ${pathnameLocale}. Cookie is: ${currentCookie}. Proceeding.`);
    // ---- Sinkronisasi Cookie jika URL dan Cookie tidak cocok ----
    if (pathnameLocale !== currentCookie) {
        console.log(`Middleware: Path locale (${pathnameLocale}) differs from cookie (${currentCookie}). Updating cookie.`);
        const response = NextResponse.next();
        response.cookies.set(LANGUAGE_STORAGE_KEY, pathnameLocale, { // <-- pathnameLocale sudah pasti Locale (string) di sini
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "lax",
        });
        return response;
    }
    return NextResponse.next();
  }

  // Pathname needs a locale prefix.
  const locale = getLocale(request);
  const newPathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const redirectUrl = new URL(newPathname, request.url);

  console.log(
    `Middleware: Path ${pathname} needs locale. Cookie was ${currentCookie}. Determined locale: ${locale}. Redirecting to ${redirectUrl.pathname}`
  );

  // Redirect and set the cookie (jika belum ada atau berbeda)
  const response = NextResponse.redirect(redirectUrl, 307);
   if (currentCookie !== locale) {
       console.log(`Middleware: Setting/Updating cookie to ${locale} during redirect.`);
       response.cookies.set(LANGUAGE_STORAGE_KEY, locale, {
           path: "/",
           maxAge: 60 * 60 * 24 * 365,
           sameSite: "lax",
       });
   }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next|api/|favicon.ico|.*\\..*).*)',
  ],
};

