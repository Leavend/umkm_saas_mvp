// src/features/marketplace/components/marketplace-page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
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
import { MobileFabDock } from "~/components/mobile-fab-dock";
import { useMarketUI } from "~/stores/use-market-ui";
import { useMarketplaceFilters } from "~/hooks/use-marketplace-filters";
import { useCredits } from "~/hooks/use-credits";
import { useIsMobile } from "~/hooks/use-mobile";
import { useSession } from "~/lib/auth-client";
import { getSavedPrompts } from "~/actions/saved-prompts";
import type { ModalType } from "~/lib/types";
import type { Prompt } from "@prisma/client";
import { useMarketplaceRouting } from "../hooks/use-marketplace-routing";
import { useModalState } from "../hooks/use-modal-state";
import { useUrlSync } from "../hooks/use-url-sync";

interface MarketplacePageProps {
  prompts: Prompt[];
  lang: string;
}

export function MarketplacePage({ prompts, lang }: MarketplacePageProps) {
  const { mode, setMode, setMobileViewMode } = useMarketUI();
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);

  // Device-specific view mode setup
  useEffect(() => {
    if (isMobile) {
      setMobileViewMode("photo-only"); // Grid view for mobile
    } else {
      setMobileViewMode("default"); // List view for desktop
    }
  }, [isMobile, setMobileViewMode]);

  // Fetch saved prompts when mode changes to 'saved'
  useEffect(() => {
    if (mode === "saved") {
      void (async () => {
        try {
          const result = await getSavedPrompts();
          if (result.success && result.data) {
            setSavedPrompts(result.data.prompts);
          }
        } catch (error) {
          console.error("Failed to fetch saved prompts:", error);
        }
      })();
    }
  }, [mode]);

  // Use prompts from database
  const allPrompts = prompts;

  // Custom hooks for cleaner state management
  const { credits, refreshCredits } = useCredits();
  const { filters, filteredPrompts, setSearchQuery, setSelectedCategory } =
    useMarketplaceFilters(allPrompts);

  // Extract complex logic into custom hooks
  const { navigateToPrompt, navigateToHome } = useMarketplaceRouting(
    lang,
    allPrompts,
    setSelectedPrompt,
  );
  const { openModal, closeModal } = useModalState(session, setActiveModal);

  // URL synchronization
  useUrlSync(setMode, setSelectedCategory);

  const handlePromptClick = useCallback(
    (prompt: Prompt) => {
      setSelectedPrompt(prompt);
      navigateToPrompt(prompt.sequenceNumber);
    },
    [setSelectedPrompt, navigateToPrompt],
  );

  const handleClosePromptDetail = useCallback(() => {
    setSelectedPrompt(null);
    navigateToHome();
  }, [setSelectedPrompt, navigateToHome]);

  // Render mode-specific content
  const renderMarketplaceContent = useCallback(() => {
    switch (mode) {
      case "gallery":
        return (
          <MarketplaceGallery
            prompts={[]}
            onCreditsUpdate={refreshCredits}
            onShowAuthModal={() => openModal("auth")}
            onPromptClick={handlePromptClick}
          />
        );
      case "saved":
        return (
          <MarketplaceSaved
            prompts={savedPrompts}
            onCreditsUpdate={refreshCredits}
            onShowAuthModal={() => openModal("auth")}
            onPromptClick={handlePromptClick}
          />
        );
      case null:
      case "browse":
      default:
        return (
          <MarketplacePromptContainer
            prompts={filteredPrompts}
            mode={mode ?? "browse"}
            onCreditsUpdate={refreshCredits}
            onShowAuthModal={() => openModal("auth")}
            onPromptClick={handlePromptClick}
          />
        );
    }
  }, [
    mode,
    filteredPrompts,
    savedPrompts,
    refreshCredits,
    openModal,
    handlePromptClick,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Header */}
      <MarketplaceHeader credits={credits} onOpenModal={openModal} />

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[var(--page-max)]">
          {/* Hero Section */}
          <MarketplaceHero />

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
            {renderMarketplaceContent()}
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
        credits={credits}
        onCreditsUpdate={refreshCredits}
      />

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={handleClosePromptDetail}
        onCreditsUpdate={refreshCredits}
        allPrompts={allPrompts}
        onNavigate={navigateToPrompt}
        onShowAuthModal={() => openModal("auth")}
      />

      <MobileFabDock />
    </div>
  );
}
