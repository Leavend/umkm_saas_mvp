// src/hooks/use-locale.ts

"use client";

import { useParams } from "next/navigation";
import type { Locale } from "~/lib/i18n";

export function useLocale(): Locale {
  const params = useParams();
  return (params?.locale as Locale) || "id";
}
