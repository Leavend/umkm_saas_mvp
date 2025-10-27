// src/app/[lang]/(dashboard)/dashboard/layout.tsx

import "~/styles/globals.css";

import type { Metadata } from "next";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
// AppSidebar sekarang async, jadi import biasa
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import BreadcrumbPageClient from "~/components/sidebar/breadcrumb-page-client";
import { LanguageToggle } from "~/components/language-toggle";
import { assertValidLocale } from "~/lib/i18n";
// (Optional) import { getDictionary } from "~/lib/dictionary";

export const metadata: Metadata = {
  title: "AI Image Editor Dashboard",
  description: "Manage your AI image editing projects",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  assertValidLocale(lang);

  // const dictionary = getDictionary(lang); // Ambil dictionary jika perlu di layout

  return (
    <SidebarProvider>
      {/* ----- Perubahan 4: Panggil AppSidebar dengan await dan teruskan lang ----- */}
      <AppSidebar />
      <SidebarInset className="flex h-screen flex-col">
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-0 z-10 border-b px-6 py-3 shadow-sm backdrop-blur">
          <div className="flex shrink-0 grow items-center gap-3">
            <SidebarTrigger className="hover:bg-muted -ml-1 h-8 w-8 transition-colors" />
            <Separator
              orientation="vertical"
              className="mr-2 h-6 data-[orientation=vertical]:h-6"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPageClient />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <LanguageToggle size="sm" />
            </div>
          </div>
        </header>
        <main className="from-background to-muted/20 flex-1 overflow-y-auto bg-gradient-to-br p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
