// src/app/layout.tsx

import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import { Providers } from "~/components/providers";
import { getRequestLocale } from "~/lib/server-locale";
import { SUPPORTED_LOCALES } from "~/lib/i18n";

const languageAlternates = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, `/${locale}`]),
) as Record<string, string>;

export const metadata: Metadata = {
  title: "AI Image Editor",
  description:
    "Lightweight AI-powered image editing platform built for small businesses to remove backgrounds, upscale photos, and crop with precision.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  alternates: {
    languages: languageAlternates,
  },
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialLocale = await getRequestLocale();

  return (
    <html lang={initialLocale} className={`${geist.variable}`}>
      <body>
        <Providers initialLocale={initialLocale}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
