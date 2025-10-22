// src/components/sidebar/sidebar-menu-items.tsx

"use client";

import { LayoutDashboard, Wand2, FolderOpen, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useLanguage, useTranslations } from "~/components/language-provider";
import { useMemo } from "react";
import { createLocalePath, stripLocaleFromPath } from "~/lib/locale-path";

export default function SidebarMenuItems() {
  const path = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const translations = useTranslations();
  const { locale } = useLanguage();

  const normalizedPath = useMemo(() => {
    const stripped = stripLocaleFromPath(path);
    if (stripped.length > 1 && stripped.endsWith("/")) {
      return stripped.slice(0, -1);
    }
    return stripped;
  }, [path]);

  const items = useMemo(
    () =>
      [
        {
          title: translations.sidebar.items.dashboard,
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: translations.sidebar.items.create,
          url: "/dashboard/create",
          icon: Wand2,
        },
        {
          title: translations.sidebar.items.projects,
          url: "/dashboard/projects",
          icon: FolderOpen,
        },
        {
          title: translations.sidebar.items.settings,
          url: "/dashboard/settings",
          icon: Settings,
        },
      ].map((item) => {
        const localizedUrl = createLocalePath(locale, item.url);
        return {
          ...item,
          url: localizedUrl,
          active: normalizedPath === item.url,
        };
      }),
    [
      locale,
      normalizedPath,
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
              href={item.url}
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