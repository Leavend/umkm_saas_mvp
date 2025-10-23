// src/components/providers.tsx

"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "~/lib/auth-client";
import { LanguageProvider, useLanguage } from "~/components/language-provider";
import type { Locale } from "~/lib/i18n";

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
  const { lang: currentLocale } = useLanguage();

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
      navigate={(path: string, options?: NavigateOptions) => {
        router.push(prefixLocaleIfNeeded(path), options);
      }}
      replace={(path: string, options?: NavigateOptions) => {
        router.replace(prefixLocaleIfNeeded(path), options);
      }}
      onSessionChange={async () => {
        router.refresh();
        try {
          const session = await authClient.getSession();
          if (session.data?.user && typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (currentPath.includes("/auth/")) {
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
