// src/components/language-toggle.tsx

"use client";

import { Languages } from "lucide-react";
import { useCallback, useTransition, type ComponentProps } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { persistUserLocale } from "~/actions/set-locale";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { TRANSLATIONS, normalizeLocale, type Locale } from "~/lib/i18n";
import { matchLocalizedPathname } from "~/lib/i18n/matcher";
import { localizedHref } from "~/lib/i18n/navigation";
import { resolveLocalizedSlug } from "~/lib/i18n/slug-resolver";

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
  const params = useParams();
  const [isPending, startPersistLocale] = useTransition();

  const currentLocale = normalizeLocale(params.lang);
  const nextLocale = currentLocale === "en" ? "id" : "en";

  const t = TRANSLATIONS[currentLocale].common.language;
  const label = nextLocale === "id" ? t.indonesian : t.english;
  const shortLabel = nextLocale === "id" ? t.shortIndonesian : t.shortEnglish;

  const handleToggle = useCallback(() => {
    const prefix = new RegExp(`^/${currentLocale}`);
    const pathWithoutLocale = pathname.replace(prefix, "") || "/";
    const match = matchLocalizedPathname(pathWithoutLocale, currentLocale);

    let targetHref = pathWithoutLocale;

    if (match) {
      const paramsCopy = { ...match.params };
      if (paramsCopy.slug) {
        paramsCopy.slug = resolveLocalizedSlug(
          match.template,
          paramsCopy.slug,
          currentLocale,
          nextLocale,
        );
      }

      targetHref = { pathname: match.template, params: paramsCopy };
    }

    const nextPath = localizedHref(nextLocale, targetHref);

    startPersistLocale(() => {
      void persistUserLocale(nextLocale).catch((error) => {
        console.error("Failed to persist locale", error);
      });
    });
    router.push(nextPath);
  }, [
    currentLocale,
    nextLocale,
    pathname,
    router,
    startPersistLocale,
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
      <span className="hidden text-xs font-medium sm:inline">{label}</span>
      <span className="sm:hidden text-xs font-semibold uppercase">
        {shortLabel}
      </span>
    </Button>
  );
}