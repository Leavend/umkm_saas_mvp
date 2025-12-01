// src/app/[lang]/layout.tsx

import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Rubik } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Providers } from "~/components/providers";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES, isSupportedLocale } from "~/lib/i18n";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "AI Image Editor",
  description:
    "Lightweight AI-powered image editing platform built for small businesses to remove backgrounds, upscale photos, and crop with precision.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-rubik",
  display: "swap",
  preload: true,
});

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isSupportedLocale(lang)) {
    notFound();
  }

  return (
    <html lang={lang} className={`${geist.variable} ${rubik.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body>
        <Providers initialLocale={lang}>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
