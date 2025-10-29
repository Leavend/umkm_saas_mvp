// src/app/[lang]/page.tsx

import { SUPPORTED_LOCALES, assertValidLocale } from "~/lib/i18n";
import { getDictionary } from "~/lib/dictionary";
import { buildHomePageContent } from "~/features/homepage/content-builder";
import { LandingPage } from "~/features/homepage/components/landing-page";
import { fetchHomePageMetricValues } from "~/server/services/homepage-metrics-service";
import { getSessionContext } from "~/server/auth/unified-session";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  assertValidLocale(lang);

  const dictionary = getDictionary(lang);
  const metricValues = await fetchHomePageMetricValues(lang);
  const content = buildHomePageContent(dictionary, metricValues);

  let hasSession = false;
  try {
    const session = await getSessionContext();
    hasSession = session.type !== "none";
  } catch {
    // Session context check failed, treat as no session
    hasSession = false;
  }

  return <LandingPage content={content} lang={lang} hasSession={hasSession} />;
}
