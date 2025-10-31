// src/app/[lang]/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import { SUPPORTED_LOCALES, assertValidLocale } from "~/lib/i18n";
import { MarketplacePage } from "~/features/marketplace/components/marketplace-page";
import { getAllPrompts } from "~/actions/prompts";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    en: "AI Prompt Marketplace - Professional AI Prompts for Content Creation",
    id: "Pasar Prompt AI - Prompt AI Profesional untuk Pembuatan Konten",
  };

  const descriptions = {
    en: "Discover thousands of professional AI prompts for image generation, content creation, and creative projects. High-quality, curated prompts for Midjourney, DALL-E, and more.",
    id: "Temukan ribuan prompt AI profesional untuk pembuatan gambar, konten, dan proyek kreatif. Prompt berkualitas tinggi yang dikurasi untuk Midjourney, DALL-E, dan lainnya.",
  };

  return {
    title: titles[lang as keyof typeof titles],
    description: descriptions[lang as keyof typeof descriptions],
    keywords: [
      "AI prompts",
      "artificial intelligence",
      "image generation",
      "content creation",
      "Midjourney",
      "DALL-E",
      "Stable Diffusion",
      "prompt engineering",
    ],
    authors: [{ name: "AI Prompt Marketplace" }],
    creator: "AI Prompt Marketplace",
    publisher: "AI Prompt Marketplace",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    ),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        id: "/id",
      },
    },
    openGraph: {
      title: titles[lang as keyof typeof titles],
      description: descriptions[lang as keyof typeof descriptions],
      url: `/${lang}`,
      siteName: "AI Prompt Marketplace",
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titles[lang as keyof typeof titles],
      description: descriptions[lang as keyof typeof descriptions],
      creator: "@aipromptmarket",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  assertValidLocale(lang);

  // Fetch all prompts
  const promptsResult = await getAllPrompts();
  const prompts = promptsResult.success ? promptsResult.prompts : [];

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-slate-600">Loading...</div>
        </div>
      }
    >
      <MarketplacePage prompts={prompts} lang={lang} />
    </Suspense>
  );
}
