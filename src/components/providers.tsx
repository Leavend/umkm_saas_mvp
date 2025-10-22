// src/components/providers.tsx

"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useCallback,
  type ComponentProps,
  type ReactNode,
} from "react";

import { authClient } from "~/lib/auth-client";
import {
  LanguageProvider,
  useLanguage,
} from "~/components/language-provider";
import type { Locale } from "~/lib/i18n";
import { createLocalePath } from "~/lib/locale-path";

interface ProvidersProps {
  children: ReactNode;
  initialLocale: Locale;
}

type NextLinkProps = ComponentProps<typeof Link>;

const LocalizedLink = forwardRef<HTMLAnchorElement, NextLinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const { locale } = useLanguage();

    const resolvedHref =
      typeof href === "string"
        ? createLocalePath(locale, href)
        : typeof href === "object" && href !== null
          ? {
              ...href,
              pathname:
                typeof href.pathname === "string"
                  ? createLocalePath(locale, href.pathname)
                  : href.pathname,
            }
          : href;

    return <Link ref={ref} href={resolvedHref} {...props} />;
  },
);

function AuthProviderWithLocale({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { locale } = useLanguage();

  const handleNavigate = useCallback(
    (href: Parameters<typeof router.push>[0], options?: Parameters<typeof router.push>[1]) => {
      const target =
        typeof href === "string"
          ? href
          : typeof href === "object" && href !== null && "pathname" in href
            ? (href.pathname as string | undefined) ?? "/"
            : href?.toString() ?? "/";
      return router.push(createLocalePath(locale, target), options);
    },
    [locale, router],
  );

  const handleReplace = useCallback(
    (href: Parameters<typeof router.replace>[0], options?: Parameters<typeof router.replace>[1]) => {
      const target =
        typeof href === "string"
          ? href
          : typeof href === "object" && href !== null && "pathname" in href
            ? (href.pathname as string | undefined) ?? "/"
            : href?.toString() ?? "/";
      return router.replace(createLocalePath(locale, target), options);
    },
    [locale, router],
  );

  const handleSessionChange = useCallback(async () => {
    router.refresh();

    try {
      const session = await authClient.getSession();
      if (session.data?.user && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const authRoot = createLocalePath(locale, "/auth");

        if (currentPath.startsWith(authRoot)) {
          router.push(createLocalePath(locale, "/dashboard"));
        }
      }
    } catch (error) {
      console.log("Session check failed:", error);
    }
  }, [locale, router]);

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={handleNavigate}
      replace={handleReplace}
      onSessionChange={handleSessionChange}
      Link={LocalizedLink}
    >
      {children}
    </AuthUIProvider>
  );
}

export function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <AuthProviderWithLocale>{children}</AuthProviderWithLocale>
    </LanguageProvider>
  );
}
