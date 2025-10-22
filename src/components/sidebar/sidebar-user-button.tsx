// src/components/sidebar/sidebar-user-button.tsx

"use client";

import { UserButton } from "@daveyplate/better-auth-ui";
import { Settings, User } from "lucide-react";

import { useTranslations } from "~/components/language-provider";

export function SidebarUserButton() {
  const translations = useTranslations();

  return (
    <UserButton
      variant="outline"
      className="border-muted-foreground/20 hover:border-primary/50 w-full transition-colors"
      disableDefaultLinks
      additionalLinks={[
        {
          label: translations.common.actions.customerPortal,
          href: "/dashboard/customer-portal",
          icon: <User className="h-4 w-4" />,
        },
        {
          label: translations.sidebar.items.settings,
          href: "/dashboard/settings",
          icon: <Settings className="h-4 w-4" />,
        },
      ]}
    />
  );
}
