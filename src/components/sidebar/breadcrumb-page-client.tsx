// src/components/sidebar/breadcrumb-page-client.tsx

"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbPage } from "../ui/breadcrumb";
import { useTranslations } from "~/components/language-provider";

export default function BreadcrumbPageClient() {
  const path = usePathname();
  const translations = useTranslations();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return translations.sidebar.items.dashboard;
      case "/dashboard/create":
        return translations.sidebar.items.create;
      case "/dashboard/projects":
        return translations.sidebar.items.projects;
      case "/dashboard/settings":
        return translations.sidebar.items.settings;
      default:
        return translations.sidebar.items.dashboard;
    }
  };

  return (
    <BreadcrumbPage className="text-foreground text-sm font-medium">
      {getPageTitle(path)}
    </BreadcrumbPage>
  );
}
