// src/actions/set-locale.ts

"use server";

import { cookies } from "next/headers";

import { LANGUAGE_STORAGE_KEY, type Locale, normalizeLocale } from "~/lib/i18n";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function persistUserLocale(nextLocale: Locale) {
  const locale = normalizeLocale(nextLocale);
  const cookieStore = await cookies();
  cookieStore.set(LANGUAGE_STORAGE_KEY, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
}
