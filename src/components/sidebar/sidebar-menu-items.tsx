// src/components/sidebar/sidebar-menu-items.tsx

"use client"; // Ini Client Component

import { LayoutDashboard, Wand2, FolderOpen, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import Link from "next/link";
import { cn } from "~/lib/utils";
// Gunakan hook Client Component
import {
  useTranslations,
  useLanguage,
  useLocalePath,
} from "~/components/language-provider";

import { useMemo } from "react";
// Import helper untuk strip locale (jika belum)
import { stripLocaleFromPathname } from "~/lib/routing";

export default function SidebarMenuItems() {
  const fullPath = usePathname(); // e.g., /en/dashboard/settings
  const { setOpenMobile, isMobile } = useSidebar();
  const translations = useTranslations();
  const { lang } = useLanguage(); // Dapatkan locale saat ini ('en' atau 'id')
  const toLocalePath = useLocalePath();

  // Dapatkan path saat ini tanpa locale untuk menentukan state 'active'
  const currentPathWithoutLocale = useMemo(
    () => stripLocaleFromPathname(fullPath, lang),
    [fullPath, lang],
  );

  const items = useMemo(
    () =>
      [
        {
          key: "dashboard",
          title: translations.sidebar.items.dashboard,
          basePath: "/dashboard", // Path dasar tanpa locale
          icon: LayoutDashboard,
        },
        {
          key: "create",
          title: translations.sidebar.items.create,
          basePath: "/dashboard/create",
          icon: Wand2,
        },
        {
          key: "projects",
          title: translations.sidebar.items.projects,
          basePath: "/dashboard/projects",
          icon: FolderOpen,
        },
        {
          key: "settings",
          title: translations.sidebar.items.settings,
          basePath: "/dashboard/settings",
          icon: Settings,
        },
      ].map((item) => {
        // Logika 'active': anggap '/' sama dengan '/dashboard'
        const isActive =
          item.basePath === "/dashboard"
            ? currentPathWithoutLocale === item.basePath ||
              currentPathWithoutLocale === "/"
            : currentPathWithoutLocale === item.basePath;

        return {
          ...item,
          // ----- Perubahan Kunci: Buat URL lengkap dengan locale -----
          url: toLocalePath(item.basePath),
          active: isActive,
        };
      }),
    [
      currentPathWithoutLocale,
      // lang, // Tambahkan lang dependency
      toLocalePath,
      translations.sidebar.items,
    ],
  );

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton
            asChild
            isActive={item.active}
            className={cn(
              "group hover:bg-primary/10 hover:text-primary relative h-10 w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              item.active && "bg-primary/15 text-primary shadow-sm",
            )}
          >
            {/* ----- Perubahan Kunci: Gunakan item.url yang sudah ber-locale ----- */}
            <Link
              href={item.url} // <-- Pastikan href ini selalu punya locale
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
