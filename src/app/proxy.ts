// src/app/proxy.ts

import { NextResponse } from "next/server";
import { match as localeMatcher } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { defaultLocale, locales } from "~/lib/i18n/locales";

function getLocale(request: Request) {
  const headers = Object.fromEntries(new Headers(request.headers));
  const negotiator = new Negotiator({ headers });
  const languages = negotiator.languages();
  return localeMatcher(languages, locales as unknown as string[], defaultLocale);
}

export function proxy(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;
  const hasLocale = (locales as readonly string[]).some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    return;
  }

  const locale = getLocale(request);
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
