// src/app/[lang]/layout.tsx

import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Rubik } from "next/font/google";
import { Toaster } from "sonner";

import { Providers } from "~/components/providers";
import { SUPPORTED_LOCALES, assertValidLocale } from "~/lib/i18n";

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
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-rubik",
});

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  assertValidLocale(lang);

  return (
    <html lang={lang} className={`${geist.variable} ${rubik.variable}`}>
      <body>
        <Providers initialLocale={lang}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
