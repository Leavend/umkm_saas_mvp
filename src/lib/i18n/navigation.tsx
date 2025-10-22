// src/lib/i18n/navigation.tsx

import NextLink from "next/link";
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation";
import { forwardRef, useMemo } from "react";
import type { ComponentProps, ReactNode } from "react";

import { type Locale } from "./locales";
import { localizePathname, type LocalizedPathnameKey } from "./pathnames";

export type LocalizedHref =
  | string
  | {
      pathname: LocalizedPathnameKey;
      params?: Record<string, string | number>;
      hash?: string;
      query?: Record<string, string | number | boolean | undefined>;
    };

function fillDynamicSegments(template: string, params: Record<string, string | number> = {}) {
  return template.replace(/\[([^\]]+)\]/g, (_, segment: string) => {
    const value = params[segment];
    if (value === undefined || value === null) {
      throw new Error(`Missing required parameter: ${segment}`);
    }
    return encodeURIComponent(String(value));
  });
}

function appendQuery(url: string, query?: Record<string, string | number | boolean | undefined>) {
  if (!query) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  if (!queryString) {
    return url;
  }

  return `${url}?${queryString}`;
}

export function localizedHref(locale: Locale, href: LocalizedHref) {
  if (typeof href === "string") {
    if (href.startsWith("#") || href.startsWith("http")) {
      return href;
    }

    const localizedPath = localizePathname(href, locale);
    const normalized = localizedPath.startsWith("/") ? localizedPath : `/${localizedPath}`;
    return `/${locale}${normalized === "/" ? "" : normalized}`;
  }

  const localizedPath = localizePathname(href.pathname, locale);
  const filledPath = fillDynamicSegments(localizedPath, href.params);
  const normalized = filledPath.startsWith("/") ? filledPath : `/${filledPath}`;
  const basePath = `/${locale}${normalized === "/" ? "" : normalized}`;
  const withQuery = appendQuery(basePath, href.query);
  return href.hash ? `${withQuery}#${href.hash}` : withQuery;
}

export interface LocalizedLinkProps extends Omit<ComponentProps<typeof NextLink>, "href"> {
  locale: Locale;
  href: LocalizedHref;
  children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ href, locale, children, ...props }, ref) => {
    const computedHref = localizedHref(locale, href);
    return (
      <NextLink {...props} href={computedHref} ref={ref}>
        {children}
      </NextLink>
    );
  },
);

Link.displayName = "LocalizedLink";

export function useLocalizedRouter(locale: Locale) {
  const router = useNextRouter();

  return useMemo(
    () => ({
      push(target: LocalizedHref, options?: Parameters<typeof router.push>[1]) {
        router.push(localizedHref(locale, target), options);
      },
      replace(target: LocalizedHref, options?: Parameters<typeof router.replace>[1]) {
        router.replace(localizedHref(locale, target), options);
      },
      prefetch(target: LocalizedHref, options?: Parameters<typeof router.prefetch>[1]) {
        router.prefetch(localizedHref(locale, target), options);
      },
      back: router.back,
      forward: router.forward,
      refresh: router.refresh,
    }),
    [locale, router],
  );
}

export function useLocalizedPathname(locale: Locale) {
  const pathname = useNextPathname();
  if (!pathname) {
    return `/${locale}`;
  }
  return pathname;
}
