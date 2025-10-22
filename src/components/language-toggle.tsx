// src/components/language-toggle.tsx

"use client";

import { Languages } from "lucide-react";
import { useCallback, useTransition, type ComponentProps } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { persistUserLocale } from "~/actions/set-locale";
import { TRANSLATIONS, DEFAULT_LOCALE, type Locale } from "~/lib/i18n";

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

  const currentLocale = (params.lang as Locale) || DEFAULT_LOCALE;
  const nextLocale = currentLocale === "en" ? "id" : "en";

  const t = TRANSLATIONS[currentLocale].common.language;
  const label = nextLocale === "id" ? t.indonesian : t.english;
  const shortLabel = nextLocale === "id" ? t.shortIndonesian : t.shortEnglish;

  const getPathWithoutLocale = (path: string, lang: string) => {
    if (path === `/${lang}`) return "/";
    return path.replace(`/${lang}`, "");
  };

  const handleToggle = useCallback(() => {
    const pathWithoutLocale = getPathWithoutLocale(pathname, currentLocale);
    const newPath = `/${nextLocale}${
      pathWithoutLocale === "/" ? "" : pathWithoutLocale
    }`;
    startPersistLocale(() => {
      void persistUserLocale(nextLocale).catch((error) => {
        console.error("Failed to persist locale", error);
      });
    });
    router.push(newPath);
  }, [nextLocale, pathname, currentLocale, router, startPersistLocale]);

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