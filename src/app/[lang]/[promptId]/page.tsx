import { notFound, redirect } from "next/navigation";
import { isSupportedLocale } from "~/lib/i18n";
import { getAllPrompts } from "~/actions/prompts";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; promptId: string }>;
}): Promise<Metadata> {
  const { lang, promptId } = await params;

  if (!isSupportedLocale(lang)) {
    return {};
  }

  const promptsResult = await getAllPrompts();
  const prompt = promptsResult.success
    ? promptsResult.data?.prompts.find((p) => p.id === promptId)
    : null;

  if (!prompt) {
    return {};
  }

  return {
    title: `${prompt.title} - AI Prompt`,
    description: prompt.text.substring(0, 160),
    openGraph: {
      title: prompt.title,
      description: prompt.text.substring(0, 160),
      images: [prompt.imageUrl],
    },
  };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ lang: string; promptId: string }>;
}) {
  const { lang, promptId } = await params;

  if (!isSupportedLocale(lang)) {
    notFound();
  }

  const promptsResult = await getAllPrompts();
  const prompts = promptsResult.success
    ? (promptsResult.data?.prompts ?? [])
    : [];

  const promptExists = prompts.some((p) => p.id === promptId);

  if (!promptExists) {
    notFound();
  }

  redirect(`/${lang}`);
}
