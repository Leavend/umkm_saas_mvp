// src/app/[lang]/page.tsx

import { SUPPORTED_LOCALES, assertValidLocale } from "~/lib/i18n";
import { getDictionary } from "~/lib/dictionary";
import { buildHomePageContent } from "~/features/homepage/content-builder";
import { LandingPage } from "~/features/homepage/components/landing-page";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const awaitedParams = await params;
  const { lang } = awaitedParams;

  assertValidLocale(lang);

  const dictionary = getDictionary(lang);
  const content = buildHomePageContent(dictionary);

  return <LandingPage content={content} lang={lang} />;
}
