// src/features/marketplace/components/marketplace-page.tsx

"use client";

import { useState } from "react";
import { useTranslations } from "~/components/language-provider";
import { AuthModal } from "~/components/auth-modal";
import { TopUpModal } from "~/components/top-up-modal";
import { SettingsModal } from "~/components/settings-modal";
import { FloatingButtons } from "~/components/floating-buttons";
import { MarketplaceHeader } from "~/components/marketplace/marketplace-header";
import { MarketplaceHero } from "~/components/marketplace/marketplace-hero";
import { MarketplaceSearch } from "~/components/marketplace/marketplace-search";
import { MarketplaceCategories } from "~/components/marketplace/marketplace-categories";
import { MarketplacePromptContainer } from "~/components/marketplace/marketplace-prompt-container";
import { useCredits } from "~/hooks/use-credits";
import { useMarketplaceFilters } from "~/hooks/use-marketplace-filters";
import type { MarketplacePageProps, ModalType } from "~/lib/types";

export function MarketplacePage({ prompts, lang }: MarketplacePageProps) {
  const translations = useTranslations();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Custom hooks for cleaner state management
  const { credits, refreshCredits } = useCredits();
  const {
    filters,
    categories,
    filteredPrompts,
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
  } = useMarketplaceFilters(prompts);

  const openModal = (modal: ModalType) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  // Side effects for floating button actions
  const handleGalleryIntent = () => {
    setViewMode("gallery");
  };

  const handleSavedIntent = () => {
    setViewMode("saved");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Header */}
      <MarketplaceHeader credits={credits} onOpenModal={openModal} />

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <MarketplaceHero />

        {/* Search and Filters */}
        <section className="border-b border-slate-200 bg-white/50 py-6">
          <div className="container-tight">
            <MarketplaceSearch
              searchQuery={filters.searchQuery}
              onSearchChange={setSearchQuery}
            />
            <div className="mt-4">
              <MarketplaceCategories
                categories={categories}
                selectedCategory={filters.selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </div>
        </section>

        {/* Prompts Container */}
        <MarketplacePromptContainer
          prompts={filteredPrompts}
          viewMode={filters.viewMode}
          onCreditsUpdate={refreshCredits}
          onShowAuthModal={() => openModal("auth")}
        />
      </main>

      {/* Floating Buttons */}
      <FloatingButtons
        onGalleryClick={handleGalleryIntent}
        onSavedClick={handleSavedIntent}
        active={filters.viewMode}
        onModeChange={setViewMode}
      />

      {/* Fixed Footer */}
      <footer
        id="site-footer"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-slate-100 py-6"
      >
        <div className="container-tight text-center text-xs text-neutral-500 md:text-sm">
          <p>{translations.marketplace.footer}</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={activeModal === "auth"}
        onClose={closeModal}
        lang={lang}
      />
      <TopUpModal
        isOpen={activeModal === "topup"}
        onClose={closeModal}
        lang={lang}
        onCreditsUpdate={refreshCredits}
      />
      <SettingsModal isOpen={activeModal === "settings"} onClose={closeModal} />
    </div>
  );
}
