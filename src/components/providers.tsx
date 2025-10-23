// src/components/providers.tsx

"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Hapus useParams dari sini
import type { ReactNode } from "react";

import { authClient } from "~/lib/auth-client";
// Import useLanguage
import { LanguageProvider, useLanguage } from "~/components/language-provider";
import type { Locale } from "~/lib/i18n";

interface ProvidersProps {
  children: ReactNode;
  initialLocale: Locale;
}

// Komponen Internal untuk mengakses context
function AuthUIWithLocale({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Gunakan useLanguage untuk mendapatkan locale saat ini dari context
  const { lang: currentLocale } = useLanguage();

  // Fungsi helper tetap sama
  const prefixLocaleIfNeeded = (path: string) => {
    if (path.startsWith("/en/") || path.startsWith("/id/")) {
      return path;
    }
    if (path === "/en" || path === "/id") {
      return path;
    }
    if (path === "/") {
      return `/${currentLocale}`;
    }
    if (path.startsWith("/")) {
      return `/${currentLocale}${path}`;
    }
    return path;
  };

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(path: string, options?: any) => {
        router.push(prefixLocaleIfNeeded(path), options);
      }}
      replace={(path: string, options?: any) => {
        router.replace(prefixLocaleIfNeeded(path), options);
      }}
      onSessionChange={async () => {
        router.refresh();
        try {
          const session = await authClient.getSession();
          if (session.data?.user && typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (currentPath.includes("/auth/")) {
              // Gunakan currentLocale dari useLanguage
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
    // LanguageProvider membungkus AuthUIWithLocale
    <LanguageProvider initialLocale={initialLocale}>
      <AuthUIWithLocale>{children}</AuthUIWithLocale>
    </LanguageProvider>
  );
}
