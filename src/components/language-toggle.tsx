// src/components/language-toggle.tsx

"use client";

import { Languages } from "lucide-react";
import { useCallback, useTransition, type ComponentProps } from "react";
import {
  useRouter,
  usePathname,
  useParams,
  useSearchParams,
} from "next/navigation";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { persistUserLocale } from "~/actions/set-locale";
import { TRANSLATIONS, DEFAULT_LOCALE, normalizeLocale } from "~/lib/i18n";
import { stripLocaleFromPathname } from "~/lib/routing";
import { useLanguage } from "~/components/language-provider";

export type LanguageToggleProps = Omit<
  ComponentProps<typeof Button>,
  "onClick"
>;

export function LanguageToggle({
  className,
  variant = "outline",
  size = "sm",
  ...props
}: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ lang?: string }>();
  const searchParams = useSearchParams();
  const [isPending, startPersistLocale] = useTransition();
  const { setLocale } = useLanguage();

  const currentLocale = normalizeLocale(params?.lang, DEFAULT_LOCALE);
  const nextLocale = currentLocale === "en" ? "id" : "en";

  const t = TRANSLATIONS[currentLocale].common.language;
  const label = nextLocale === "id" ? t.indonesian : t.english;
  const shortLabel = nextLocale === "id" ? t.shortIndonesian : t.shortEnglish;

  const handleToggle = useCallback(() => {
    const targetLocale = nextLocale;
    setLocale(targetLocale);

    const pathWithoutLocale = stripLocaleFromPathname(pathname, currentLocale);
    const normalizedPath = pathWithoutLocale === "/" ? "" : pathWithoutLocale;
    const query = searchParams?.toString();
    const hash =
      typeof window !== "undefined" && window.location.hash
        ? window.location.hash
        : "";
    const newPath = `/${targetLocale}${normalizedPath}${query ? `?${query}` : ""}${hash}`;
    startPersistLocale(() => {
      void persistUserLocale(targetLocale).catch((error) => {
        console.error("Failed to persist locale", error);
      });
    });
    router.replace(newPath);
  }, [
    currentLocale,
    pathname,
    router,
    searchParams,
    setLocale,
    startPersistLocale,
    nextLocale,
  ]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggle}
      aria-label={`${t.toggle} (${label})`}
      className={cn("min-w-[3rem]", className)}
      aria-busy={isPending}
      disabled={isPending}
      {...props}
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-semibold uppercase">{shortLabel}</span>
    </Button>
  );
}
