// src/components/sidebar/sidebar-brand.tsx

"use client";

import { Sparkles } from "lucide-react";

import { useLanguage, useTranslations } from "~/components/language-provider";
import { Link } from "~/lib/i18n/navigation";

export function SidebarBrand() {
  const translations = useTranslations();
  const { locale } = useLanguage();
  const { common } = translations;

  return (
    <Link locale={locale} href="/" className="mb-1 flex items-center gap-2">
      <Sparkles className="text-primary h-6 w-6" />
      <div className="flex flex-col leading-none">
        <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          {common.brand.short}
        </span>
        <span className="text-muted-foreground text-sm font-medium">
          {common.brand.suffix}
        </span>
      </div>
    </Link>
  );
}
