"use server";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "../ui/sidebar";
import Credits from "./credits";
import SidebarMenuItems from "./sidebar-menu-items";
import Upgrade from "./upgrade";
import MobileSidebarClose from "./mobile-sidebar-close";
import { SidebarBrand } from "~/components/sidebar/sidebar-brand";
import { LanguageToggle } from "~/components/language-toggle";
import { SidebarUserButton } from "~/components/sidebar/sidebar-user-button";

export async function AppSidebar() {
  return (
    <Sidebar className="from-background to-muted/20 border-r-0 bg-gradient-to-b">
      <SidebarContent className="px-3">
        <MobileSidebarClose />
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary mt-6 mb-8 flex flex-col items-start justify-start gap-2 px-2">
            <SidebarBrand />
            <LanguageToggle className="w-full justify-start" size="sm" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-muted/30 border-t p-3">
        <div className="mb-3 flex w-full items-center justify-center gap-2 text-xs">
          <Credits />
          <Upgrade />
        </div>
        <SidebarUserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
