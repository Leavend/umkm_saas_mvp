// src/components/language-toggle.tsx

"use client";

import { Languages } from "lucide-react";
import { useCallback, useTransition, type ComponentProps } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useLanguage, useTranslations } from "~/components/language-provider";
import { persistUserLocale } from "~/actions/set-locale";

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
  const { locale, setLocale } = useLanguage();
  const translations = useTranslations();
  const [isPending, startPersistLocale] = useTransition();
  const isEnglish = locale === "en";
  const nextLocale = isEnglish ? "id" : "en";

  const label = isEnglish
    ? translations.common.language.indonesian
    : translations.common.language.english;
  const shortLabel = isEnglish
    ? translations.common.language.shortIndonesian
    : translations.common.language.shortEnglish;

  const handleToggle = useCallback(() => {
    const targetLocale = nextLocale;
    setLocale(targetLocale);
    startPersistLocale(() => {
      void persistUserLocale(targetLocale).catch((error) => {
        console.error("Failed to persist locale", error);
      });
    });
  }, [nextLocale, setLocale, startPersistLocale]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggle}
      aria-label={`${translations.common.language.toggle} (${label})`}
      className={cn("min-w-[3rem]", className)}
      aria-busy={isPending}
      disabled={isPending}
      {...props}
    >
      <Languages className="h-4 w-4" />
      <span className="hidden text-xs font-medium sm:inline">{label}</span>
      <span className="sm:hidden text-xs font-semibold uppercase">{shortLabel}</span>
    </Button>
  );
}
