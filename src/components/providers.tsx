// Providers wrapper component
"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "~/components/language-provider";
import { PostHogProvider } from "~/components/analytics/posthog-provider";
import { PostHogPageView } from "~/components/analytics/posthog-page-view";
import type { Locale } from "~/lib/i18n";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <SessionProvider>
      <PostHogProvider>
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        <LanguageProvider initialLocale={initialLocale}>
          {children}
        </LanguageProvider>
      </PostHogProvider>
    </SessionProvider>
  );
}
