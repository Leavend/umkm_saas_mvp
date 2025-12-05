import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isSupportedLocale } from "~/lib/i18n";
import {
  getPromptBySequence,
  getAllPrompts,
} from "~/server/services/prompt-service";
import { MarketplacePage } from "~/features/marketplace/components/marketplace-page";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; promptSeq: string }>;
}): Promise<Metadata> {
  const { lang, promptSeq } = await params;

  if (!isSupportedLocale(lang)) {
    return {};
  }

  const seq = parseInt(promptSeq, 10);
  if (isNaN(seq) || seq <= 0) {
    return {};
  }

  try {
    const prompt = await getPromptBySequence(seq);

    return {
      title: `${prompt.title} - AI Prompt`,
      description: prompt.text.substring(0, 160),
      openGraph: {
        title: prompt.title,
        description: prompt.text.substring(0, 160),
        images: [prompt.imageUrl],
      },
    };
  } catch {
    return {};
  }
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ lang: string; promptSeq: string }>;
}) {
  const { lang, promptSeq } = await params;

  if (!isSupportedLocale(lang)) {
    notFound();
  }

  const seq = parseInt(promptSeq, 10);
  if (isNaN(seq) || seq <= 0) {
    notFound();
  }

  // Verify prompt exists
  try {
    await getPromptBySequence(seq);
  } catch {
    notFound();
  }

  // Fetch all prompts for the marketplace background
  const prompts = await getAllPrompts();

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
