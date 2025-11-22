// src/components/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "~/components/language-provider";
import type { Locale } from "~/lib/i18n";

/**
 * Wraps the application with required context providers.
 * - SessionProvider: provides NextAuth session data.
 * - LanguageProvider: handles i18n locale.
 */
export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <SessionProvider>
      <LanguageProvider initialLocale={initialLocale}>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}
