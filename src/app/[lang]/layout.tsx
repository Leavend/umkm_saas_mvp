// src/app/layout.tsx

import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import { Providers } from "~/components/providers";
import { locales, type Locale } from "~/lib/i18n/locales";
import { normalizeLocale } from "~/lib/i18n";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const metadataBase = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL)
  : undefined;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const { lang } = params;
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `/${locale}`]),
  );

  return {
    metadataBase,
    title: "AI Image Editor",
    description:
      "Lightweight AI-powered image editing platform built for small businesses to remove backgrounds, upscale photos, and crop with precision.",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    alternates: {
      canonical: `/${lang}`,
      languages,
    },
  } satisfies Metadata;
}

export default function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { lang: Locale } }>) {
  const locale = normalizeLocale(params.lang);

  return (
    <html lang={locale} className={`${geist.variable}`}>
      <body>
        <Providers initialLocale={locale}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
