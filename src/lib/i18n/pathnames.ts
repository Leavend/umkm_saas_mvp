import type { Locale } from './locales';

export const pathnames = {
  '/': '/',
  '/auth/sign-in':     { en: '/auth/sign-in',     id: '/auth/masuk' },
  '/auth/sign-up':     { en: '/auth/sign-up',     id: '/auth/daftar' },
  '/auth/forgot':      { en: '/auth/forgot',      id: '/auth/lupa' },
  '/pricing':          { en: '/pricing',          id: '/harga' },
  '/dashboard':        { en: '/dashboard',        id: '/dasbor' },
  '/blog':             { en: '/blog',             id: '/artikel' },
  '/blog/[slug]':      { en: '/blog/[slug]',      id: '/artikel/[slug]' },
  '/products':         { en: '/products',         id: '/produk' },
  '/products/[slug]':  { en: '/products/[slug]',  id: '/produk/[slug]' }
} as const;

export type Template = keyof typeof pathnames;

export function localizePath(template: Template, locale: Locale) {
  const val = pathnames[template];
  return typeof val === 'string' ? val : val[locale];
}
