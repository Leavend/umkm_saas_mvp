// src/lib/i18n/slug-resolver.ts

import { blogPosts } from "../content/blog-posts";
import { products } from "../content/products";
import type { Locale } from "./locales";
import { invertSlugMap, pickSlug, type LocalizedSlugRecord } from "./slug";
import type { LocalizedPathnameKey } from "./pathnames";

const slugSources: Partial<Record<LocalizedPathnameKey, LocalizedSlugRecord[]>> = {
  "/products/[slug]": products,
  "/blog/[slug]": blogPosts,
};

export function resolveLocalizedSlug(
  template: LocalizedPathnameKey,
  currentSlug: string,
  fromLocale: Locale,
  toLocale: Locale,
) {
  const source = slugSources[template];
  if (!source) {
    return currentSlug;
  }

  const map = invertSlugMap(source, fromLocale);
  const record = map.get(currentSlug);
  if (!record) {
    return currentSlug;
  }

  return pickSlug(record, toLocale);
}

export function listLocalizedSlugs(template: LocalizedPathnameKey, locale: Locale) {
  const source = slugSources[template] ?? [];
  return source.map((record) => pickSlug(record, locale));
}

export function getLocalizedRecord<T extends LocalizedSlugRecord>(
  template: LocalizedPathnameKey,
  locale: Locale,
  slug: string,
) {
  const source = slugSources[template] as T[] | undefined;
  if (!source) {
    return null;
  }

  const map = invertSlugMap(source, locale);
  return map.get(slug) ?? null;
}
