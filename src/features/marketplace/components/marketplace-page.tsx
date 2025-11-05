// src/features/marketplace/components/marketplace-page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MarketplaceHero } from "~/components/marketplace/marketplace-hero";
import { MarketplaceFilterBar } from "~/components/marketplace/marketplace-filter-bar";
import { MarketplaceGallery } from "~/components/marketplace/marketplace-gallery";
import { MarketplaceSaved } from "~/components/marketplace/marketplace-saved";
import { MarketplacePromptContainer } from "~/components/marketplace/marketplace-prompt-container";
import { PromptDetailModal } from "~/components/prompt-detail-modal";
import { MarketplaceHeader } from "~/components/marketplace/marketplace-header";
import { StickyActionsRail } from "~/components/sticky-actions-rail";
import { Footer } from "~/components/footer";
import { AuthModal } from "~/components/auth-modal";
import { TopUpModal } from "~/components/top-up-modal";
import { SettingsModal } from "~/components/settings-modal";
import { MobileFabDock } from "~/components/mobile-fab-dock";
import { useMarketUI } from "~/stores/use-market-ui";
import { useMarketplaceFilters } from "~/hooks/use-marketplace-filters";
import { useCredits } from "~/hooks/use-credits";
import { useIsMobile } from "~/hooks/use-mobile";
import type { ModalType } from "~/lib/types";
import type { Prompt } from "@prisma/client";
import { PLACEHOLDER_PROMPTS } from "~/lib/placeholder-data";

interface MarketplacePageProps {
  prompts: Prompt[];
  lang: string;
}

export function MarketplacePage({
  prompts: _prompts,
  lang,
}: MarketplacePageProps) {
  const { mode, setMode, setMobileViewMode } = useMarketUI();
  const isMobile = useIsMobile();
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Set default view mode based on device
  useEffect(() => {
    if (isMobile) {
      setMobileViewMode("photo-only"); // Grid view for mobile
    } else {
      setMobileViewMode("default"); // List view for desktop
    }
  }, [isMobile, setMobileViewMode]);

  // Update URL when mode changes - DISABLED to prevent URL changes
  // useEffect(() => {
  //   const currentParams = new URLSearchParams(searchParams.toString());

  //   if (mode === null) {
  //     currentParams.delete("mode");
  //   } else {
  //     currentParams.set("mode", mode);
  //   }

  //   const newUrl = `${pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ""}`;
  //   router.replace(newUrl, { scroll: false });
  // }, [mode, pathname, router, searchParams]);
  // State lokal selectedCategories dihapus, gunakan dari useMarketplaceFilters

  // Use placeholder data for development
  const allPrompts = PLACEHOLDER_PROMPTS;

  // Custom hooks for cleaner state management
  const { credits, refreshCredits } = useCredits();
  const { filters, filteredPrompts, setSearchQuery, setSelectedCategory } =
    useMarketplaceFilters(allPrompts);

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  const openPromptDetail = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    // Update URL to /[lang]/[id]
    router.push(`/${lang}/${prompt.id}`, { scroll: false });
  };

  const closePromptDetail = () => {
    setSelectedPrompt(null);
    // Go back to base marketplace URL
    router.push(`/${lang}`, { scroll: false });
  };

  // Sync mode with URL on mount
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "gallery" || modeParam === "saved") {
      setMode(modeParam);
    }

    // Sync category with URL on mount
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write mode and category to URL when they change - DISABLED to prevent URL changes
  // useEffect(() => {
  //   const params = new URLSearchParams(Array.from(searchParams.entries()));
  //   if (mode === "browse" || mode === null) {
  //     params.delete("mode");
  //   } else {
  //     params.set("mode", mode);
  //   }

  //   // Set category parameter
  //   if (selectedCategories.length > 0 && selectedCategories[0]) {
  //     params.set("category", selectedCategories[0]);
  //   } else {
  //     params.delete("category");
  //   }

  //   const newUrl = params.toString() ? `?${params.toString()}` : pathname;
  //   router.replace(newUrl, { scroll: false });
  // }, [mode, selectedCategories, searchParams, router, pathname]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length === 2 && pathParts[0] === lang) {
        // We're on /[lang]/[id] - find and open the prompt
        const promptId = pathParts[1];
        const prompt = allPrompts.find((p: Prompt) => p.id === promptId);
        if (prompt) {
          setSelectedPrompt(prompt);
        }
      } else if (pathParts.length === 1 && pathParts[0] === lang) {
        // We're on /[lang] - close modal
        setSelectedPrompt(null);
      }
    };

    handleRouteChange();
  }, [pathname, lang, allPrompts]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Header */}
      <MarketplaceHeader credits={credits} onOpenModal={openModal} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Unified page wrapper for all sections */}
        <div className="mx-auto w-full max-w-[var(--page-max)]">
          {/* Hero Section */}
          <MarketplaceHero />

          {/* Quick Start */}
          {/* <section className="mt-6 md:mt-8">
            <Container>
              <QuickStartPills onSelect={handleQuickSelect} />
            </Container>
          </section> */}

          {/* Sticky Filter Bar */}
          <MarketplaceFilterBar
            searchQuery={filters.searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={
              filters.selectedCategory === "all"
                ? null
                : filters.selectedCategory
            }
            onCategoryChange={(category) =>
              setSelectedCategory(category ?? "all")
            }
            lastUpdated={new Date()}
          />

          {/* Cards / Available Prompts */}
          <section className="relative pb-24 md:pb-28">
            {/* Mode-specific content */}
            {mode === "gallery" ? (
              <MarketplaceGallery
                prompts={[]}
                onCreditsUpdate={refreshCredits}
                onShowAuthModal={() => openModal("auth")}
                onPromptClick={openPromptDetail}
              />
            ) : mode === "saved" ? (
              <MarketplaceSaved
                prompts={[]}
                onCreditsUpdate={refreshCredits}
                onShowAuthModal={() => openModal("auth")}
                onPromptClick={openPromptDetail}
              />
            ) : (
              <MarketplacePromptContainer
                prompts={filteredPrompts}
                mode={mode}
                onCreditsUpdate={refreshCredits}
                onShowAuthModal={() => openModal("auth")}
                onPromptClick={openPromptDetail}
              />
            )}

            {/* Sticky Actions Rail */}
            <StickyActionsRail />
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer
        productName="Apakek Prompt"
        parentBrand="UMKMJaya"
        org="Bontang Techno Hub"
        lastUpdated="2025-11-01"
      />

      {/* Modals */}
      <AuthModal isOpen={activeModal === "auth"} onClose={closeModal} />
      <TopUpModal
        isOpen={activeModal === "topup"}
        onClose={closeModal}
        lang={lang}
        onCreditsUpdate={refreshCredits}
      />
      <SettingsModal isOpen={activeModal === "settings"} onClose={closeModal} />

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={closePromptDetail}
        onCreditsUpdate={refreshCredits}
      />

      <MobileFabDock />
    </div>
  );
}
