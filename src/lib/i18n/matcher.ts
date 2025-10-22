// src/lib/i18n/matcher.ts

import type { Locale } from "./locales";
import { localizePathname, type LocalizedPathnameKey, pathnames } from "./pathnames";

export interface LocalizedPathMatch {
  template: LocalizedPathnameKey;
  params: Record<string, string>;
}

function createMatcher(pattern: string) {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[([^\\\]]+)\\\]/g, "(?<$1>[^/]+)");
  return new RegExp(`^${escaped}$`);
}

export function matchLocalizedPathname(pathname: string, locale: Locale): LocalizedPathMatch | null {
  for (const template of Object.keys(pathnames) as LocalizedPathnameKey[]) {
    const localized = localizePathname(template, locale);
    const matcher = createMatcher(localized);
    const match = matcher.exec(pathname);
    if (!match) continue;

    const params: Record<string, string> = {};
    if (match.groups) {
      for (const [key, value] of Object.entries(match.groups)) {
        params[key] = value;
      }
    }

    return { template, params };
  }

  return null;
}
