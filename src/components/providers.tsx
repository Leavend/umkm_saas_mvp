// src/components/providers.tsx

"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";
import { forwardRef, type ReactNode } from "react";

import { LanguageProvider, useLanguage } from "~/components/language-provider";
import { authClient } from "~/lib/auth-client";
import { Link as LocalizedLink, type LocalizedLinkProps } from "~/lib/i18n/navigation";
import type { Locale } from "~/lib/i18n";

const AuthLink = forwardRef<HTMLAnchorElement, Omit<LocalizedLinkProps, "locale">>(
  (props, ref) => {
    const { locale } = useLanguage();
    return <LocalizedLink {...props} locale={locale} ref={ref} />;
  },
);
AuthLink.displayName = "AuthLink";

interface ProvidersProps {
  children: ReactNode;
  initialLocale: Locale;
}

export function Providers({ children, initialLocale }: ProvidersProps) {
  const router = useRouter();

  return (
    <LanguageProvider initialLocale={initialLocale}>
      <AuthUIProvider
        authClient={authClient}
        navigate={(...args) => router.push(...args)}
        replace={(...args) => router.replace(...args)}
        onSessionChange={async () => {
          // Clear router cache (protected routes)
          router.refresh();

          // Check if user is authenticated and redirect to dashboard
          try {
            const session = await authClient.getSession();
            if (session.data?.user && typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              // Only redirect if we're on an auth page
              if (currentPath.startsWith("/auth/")) {
                router.push("/dashboard");
              }
            }
          } catch (error) {
            // Session check failed, user likely logged out
            console.log("Session check failed:", error);
          }
        }}
        Link={AuthLink}
      >
        {children}
      </AuthUIProvider>
    </LanguageProvider>
  );
}
