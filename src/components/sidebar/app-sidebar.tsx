// src/components/sidebar/app-sidebar.tsx

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "../ui/sidebar";
import Credits from "./credits"; // Server Component, perlu di-await
import SidebarMenuItems from "./sidebar-menu-items"; // Client Component
import Upgrade from "./upgrade"; // Client Component
import MobileSidebarClose from "./mobile-sidebar-close"; // Client Component
import { SidebarBrand } from "~/components/sidebar/sidebar-brand"; // Client Component
import { SidebarUserButton } from "~/components/sidebar/sidebar-user-button"; // Client Component
export async function AppSidebar() {
  // Anda tidak perlu getDictionary di sini kecuali ada teks statis
  // Komponen klien di bawah akan mendapatkan terjemahan dari Context Provider

  return (
    <Sidebar className="from-background to-muted/20 border-r-0 bg-gradient-to-b">
      <SidebarContent className="px-3">
        <MobileSidebarClose />
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary mt-6 mb-8 flex flex-col items-start justify-start gap-2 px-2">
            <SidebarBrand />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* SidebarMenuItems akan gunakan useLanguage() & useTranslations() */}
              <SidebarMenuItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-muted/30 border-t p-3">
        <div className="mb-3 flex w-full items-center justify-center gap-2 text-xs">
          {/* Await Server Component Credits */}
          <Credits />
          <Upgrade />
        </div>
        <SidebarUserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
