// src/components/sidebar/breadcrumb-page-client.tsx

"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { BreadcrumbPage } from "../ui/breadcrumb";
import { useTranslations, useLanguage } from "~/components/language-provider";
import { stripLocaleFromPathname } from "~/lib/routing";

export default function BreadcrumbPageClient() {
  const path = usePathname();
  const translations = useTranslations();

  const { lang } = useLanguage();
  const { items } = translations.sidebar;

  const normalizedPath = useMemo(
    () => stripLocaleFromPathname(path, lang),
    [lang, path],
  );

  const pageTitle = useMemo(() => {
    switch (normalizedPath) {
      case "/dashboard":
        return items.dashboard;
      case "/dashboard/create":
        return items.create;
      case "/dashboard/projects":
        return items.projects;
      case "/dashboard/top-up":
        return items.topUp;
      case "/dashboard/settings":
        return items.settings;
      default:
        return items.dashboard;
    }
  }, [items, normalizedPath]);

  return (
    <BreadcrumbPage className="text-foreground text-sm font-medium">
      {pageTitle}
    </BreadcrumbPage>
  );
}
