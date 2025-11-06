// src/components/sidebar/sidebar-menu-items.tsx

"use client"; // Ini Client Component

import { CreditCard, Settings, User } from "lucide-react";
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
import { useSession } from "~/lib/auth-client";

import { useMemo } from "react";
// Import helper untuk strip locale (jika belum)
import { stripLocaleFromPathname } from "~/lib/routing";

// Helper to get guest session ID from cookies
const getGuestSessionIdFromCookies = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, ...value] = cookie.trim().split("=");
    if (name === "guest_session_id") {
      return decodeURIComponent(value.join("=")) || null;
    }
  }
  return null;
};

export default function SidebarMenuItems() {
  const fullPath = usePathname(); // e.g., /en/dashboard/settings
  const { setOpenMobile, isMobile } = useSidebar();
  const translations = useTranslations();
  const { lang } = useLanguage(); // Dapatkan locale saat ini ('en' atau 'id')
  const toLocalePath = useLocalePath();
  const { data: session } = useSession(); // Check authenticated user session

  // ===== EXPLICIT STRUCTURAL LOGIC =====
  // Derive strict boolean constants for user state
  const user_auth_session = session?.user;
  const guest_session_id = getGuestSessionIdFromCookies();

  // Define state constants as per specification
  const isAuthenticated = !!user_auth_session; // True if authenticated user
  const isGuest = !!guest_session_id && !isAuthenticated; // True if ONLY guest, not authenticated

  // Dapatkan path saat ini tanpa locale untuk menentukan state 'active'
  const currentPathWithoutLocale = useMemo(
    () => stripLocaleFromPathname(fullPath, lang),
    [fullPath, lang],
  );

  const items = useMemo(() => {
    // All available items
    const allItems = [
      {
        key: "login",
        title: "Login",
        basePath: "/auth/sign-in",
        icon: User,
        requiresAuth: false, // Show only to non-authenticated
        showOnlyIfNotAuth: true,
      },
      {
        key: "topUp",
        title: translations.sidebar.items.topUp,
        basePath: "/dashboard/top-up",
        icon: CreditCard,
        requiresAuth: false, // Show to both
      },
      {
        key: "settings",
        title: translations.sidebar.items.settings,
        basePath: "/dashboard/settings",
        icon: Settings,
        requiresAuth: true, // Hide from guests
      },
    ];

    // Filter items based on user type
    const filteredItems = allItems.filter((item) => {
      // If guest user, hide items that require auth
      if (isGuest && item.requiresAuth) {
        return false;
      }
      // Show login only if not authenticated
      if (item.showOnlyIfNotAuth && isAuthenticated) {
        return false;
      }
      return true;
    });

    return filteredItems.map((item) => {
      const isActive = currentPathWithoutLocale === item.basePath;

      return {
        ...item,
        url: toLocalePath(item.basePath),
        active: isActive,
      };
    });
  }, [
    currentPathWithoutLocale,
    isGuest,
    isAuthenticated,
    toLocalePath,
    translations.sidebar.items,
  ]);

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
              "group hover:bg-brand-50 hover:text-brand-700 relative h-10 w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              item.active &&
                "bg-brand-50 text-brand-800 border-brand-500 border-l-4 shadow-sm",
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
                    ? "text-brand-600"
                    : "text-muted-foreground group-hover:text-brand-700",
                )}
              />
              <span className="truncate">{item.title}</span>
              {item.active && (
                <div className="bg-brand-500 absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full" />
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
