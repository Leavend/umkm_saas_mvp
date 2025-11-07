// src/components/providers.tsx

"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { authClient } from "~/lib/auth-client";
import {
  LanguageProvider,
  useLocalePath,
} from "~/components/language-provider";
import type { Locale } from "~/lib/i18n";
import { SUPPORTED_LOCALES } from "~/lib/i18n";

const AUTH_PATH_REGEX = new RegExp(
  `^/(?:${SUPPORTED_LOCALES.join("|")})/auth/`,
);

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
  const toLocalePath = useLocalePath();
  const navigateWithLocale = useCallback(
    (path: string, options?: NavigateOptions) => {
      router.push(toLocalePath(path), options);
    },
    [router, toLocalePath],
  );

  const replaceWithLocale = useCallback(
    (path: string, options?: NavigateOptions) => {
      router.replace(toLocalePath(path), options);
    },
    [router, toLocalePath],
  );

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={navigateWithLocale}
      replace={replaceWithLocale}
      onSessionChange={async () => {
        router.refresh();
        try {
          const session = await authClient.getSession();
          if (session.data?.user && typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (AUTH_PATH_REGEX.test(currentPath)) {
              router.push(toLocalePath("/"));
            }
          }
        } catch (error) {
          console.error("Session check failed:", error);
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
