// src/lib/i18n/pathnames.ts

import type { Locale } from "./locales";

export const pathnames: Record<string, string | Record<Locale, string>> = {
  "/": "/",
  "/pricing": { en: "/pricing", id: "/harga" },
  "/dashboard": { en: "/dashboard", id: "/dasbor" },
  "/dashboard/create": { en: "/dashboard/create", id: "/dasbor/buat" },
  "/dashboard/projects": { en: "/dashboard/projects", id: "/dasbor/proyek" },
  "/dashboard/projects/[projectId]": {
    en: "/dashboard/projects/[projectId]",
    id: "/dasbor/proyek/[projectId]",
  },
  "/dashboard/settings": { en: "/dashboard/settings", id: "/dasbor/pengaturan" },
  "/dashboard/customer-portal": {
    en: "/dashboard/customer-portal",
    id: "/dasbor/portal-pelanggan",
  },
  "/auth/sign-in": { en: "/auth/sign-in", id: "/auth/masuk" },
  "/auth/sign-up": { en: "/auth/sign-up", id: "/auth/daftar" },
  "/blog": { en: "/blog", id: "/artikel" },
  "/blog/[slug]": { en: "/blog/[slug]", id: "/artikel/[slug]" },
  "/products": { en: "/products", id: "/produk" },
  "/products/[slug]": { en: "/products/[slug]", id: "/produk/[slug]" },
};

export function localizePathname(template: string, locale: Locale) {
  const value = pathnames[template];
  if (!value) {
    return template;
  }

  return typeof value === "string" ? value : value[locale];
}

export type LocalizedPathnameKey = keyof typeof pathnames;
