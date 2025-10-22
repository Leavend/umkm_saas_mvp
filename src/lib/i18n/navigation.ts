// src/lib/i18n/navigation.ts

import {localizePath, pathnames, type Template} from './pathnames';
import {locales, type Locale} from './locales';

export function buildHref(
  template: Template,
  locale: Locale,
  params?: Record<string, string | number>
) {
  let p = localizePath(template, locale);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      p = p.replace(`[${k}]`, String(v));
    }
  }
  return `/${locale}${p === '/' ? '' : p}`;
}

export function detectTemplate(pathname: string): Template | null {

  const entries = Object.entries(pathnames) as [Template, any][];
  for (const [tpl, map] of entries) {
    const patterns = typeof map === 'string' ? [map] : Object.values(map);
    if (patterns.some((pat) => matchPattern(pat, pathname))) return tpl;
  }
  return null;
}

function matchPattern(pattern: string, path: string) {
  const re = new RegExp('^' + pattern.replace(/\[.+?\]/g, '[^/]+') + '$');
  return re.test(path);
}

export function switchLocalePath(
  fullPath: string,
  to: Locale
) {
  const [, curLocale, ...rest] = fullPath.split('/');
  if (!locales.includes(curLocale as Locale)) return fullPath;

  const restPath = '/' + rest.join('/');
  const tpl = detectTemplate(restPath);
  if (!tpl) return `/${to}${restPath}`;

  const params: Record<string, string> = {};
  const localizedCurrent =
    typeof pathnames[tpl] === 'string'
      ? (pathnames[tpl] as string)
      : (pathnames[tpl] as any)[curLocale as Locale];

  const keys = (tpl.match(/\[(.+?)\]/g) || []).map((k) => k.slice(1, -1));
  if (keys.length) {
    const curParts = restPath.split('/');
    const patParts = (localizedCurrent as string).split('/');
    keys.forEach((k, i) => {
      const idx = patParts.findIndex((p) => p === `[${k}]`);
      if (idx >= 0) params[k] = curParts[idx] || '';
    });
  }

  return buildHref(tpl, to as Locale, params);
}
