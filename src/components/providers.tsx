// src/components/providers.tsx

"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "~/lib/auth-client";
import { LanguageProvider, useLanguage } from "~/components/language-provider";
import type { Locale } from "~/lib/i18n";
import { SUPPORTED_LOCALES } from "~/lib/i18n";


interface ProvidersProps {
  children: ReactNode;
  initialLocale: Locale;
}

interface NavigateOptions {
  scroll?: boolean;
  shallow?: boolean;
}

function AuthUIWithLocale({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { lang: currentLocale } = useLanguage(); // Dapatkan locale saat ini

  const prefixLocaleIfNeeded = (path: string): string => {
    // Cek apakah path sudah memiliki prefix locale yang valid
    const hasValidLocalePrefix = SUPPORTED_LOCALES.some(
      (loc) => path === `/${loc}` || path.startsWith(`/${loc}/`),
    );

    if (hasValidLocalePrefix) {
      return path; // Sudah punya, jangan ubah
    }

    // Jika path root '/', tambahkan locale
    if (path === "/") {
      return `/${currentLocale}`;
    }

    // Jika path mulai dengan '/', tambahkan locale di depan
    if (path.startsWith("/")) {
      // Hindari // jika path sudah /
      return `/${currentLocale}${path}`;
    }

    console.warn(`AuthUIProvider: Path "${path}" is relative or unexpected, not prefixing locale.`);
    return path;
  };

  return (
    <AuthUIProvider
      authClient={authClient}
      // ----- Perubahan: Modifikasi navigate dan replace -----
      navigate={(path: string, options?: NavigateOptions) => {
        const prefixedPath = prefixLocaleIfNeeded(path);
        console.log(`AuthUI Navigating: ${path} -> ${prefixedPath}`); // Logging
        router.push(prefixedPath, options);
      }}
      replace={(path: string, options?: NavigateOptions) => {
        const prefixedPath = prefixLocaleIfNeeded(path);
        console.log(`AuthUI Replacing: ${path} -> ${prefixedPath}`); // Logging
        router.replace(prefixedPath, options);
      }}
      onSessionChange={async () => {
        router.refresh();
        try {
          const session = await authClient.getSession();
          if (session.data?.user && typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            const authPathRegex = /^\/(en|id)\/auth\//;
            if (authPathRegex.test(currentPath)) {
              console.log(`AuthUI SessionChange: Redirecting from ${currentPath} to /${currentLocale}/dashboard`);
              router.push(`/${currentLocale}/dashboard`);
            }
          }
        } catch (error) {
          console.log("Session check failed:", error);
        }
      }}
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  );
}

export function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <AuthUIWithLocale>{children}</AuthUIWithLocale>
    </LanguageProvider>
  );
}
