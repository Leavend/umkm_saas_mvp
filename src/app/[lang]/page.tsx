// src/app/[lang]/page.tsx

import type { Locale } from "~/lib/i18n";
import { getDictionary } from "~/lib/dictionary";
import { buildHomePageContent } from "~/features/homepage/content-builder";
import { LandingPage } from "~/features/homepage/components/landing-page";

export default async function HomePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  const content = buildHomePageContent(dictionary);

  return <LandingPage content={content} />;
}
