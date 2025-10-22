// src/components/sidebar/sidebar-menu-items.tsx

"use client";

import { LayoutDashboard, Wand2, FolderOpen, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useLanguage, useTranslations } from "~/components/language-provider";
import { Link, localizedHref } from "~/lib/i18n/navigation";
import { cn } from "~/lib/utils";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";

export default function SidebarMenuItems() {
  const path = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const translations = useTranslations();
  const { locale } = useLanguage();

  const items = useMemo(
    () =>
      [
        {
          title: translations.sidebar.items.dashboard,
          pathname: "/dashboard" as const,
          icon: LayoutDashboard,
        },
        {
          title: translations.sidebar.items.create,
          pathname: "/dashboard/create" as const,
          icon: Wand2,
        },
        {
          title: translations.sidebar.items.projects,
          pathname: "/dashboard/projects" as const,
          icon: FolderOpen,
        },
        {
          title: translations.sidebar.items.settings,
          pathname: "/dashboard/settings" as const,
          icon: Settings,
        },
      ].map((item) => {
        const href = localizedHref(locale, item.pathname);
        return {
          ...item,
          href,
          active: path === href,
        };
      }),
    [
      locale,
      path,
      translations.sidebar.items.create,
      translations.sidebar.items.dashboard,
      translations.sidebar.items.projects,
      translations.sidebar.items.settings,
    ],
  );

  const handleMenuClick = () => {
    // Close mobile sidebar when clicking a menu item
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={item.active}
            className={cn(
              "group hover:bg-primary/10 hover:text-primary relative h-10 w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              item.active && "bg-primary/15 text-primary shadow-sm",
            )}
          >
            <Link
              locale={locale}
              href={item.pathname}
              onClick={handleMenuClick}
              className="flex items-center gap-3"
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span className="truncate">{item.title}</span>
              {item.active && (
                <div className="bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full" />
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}