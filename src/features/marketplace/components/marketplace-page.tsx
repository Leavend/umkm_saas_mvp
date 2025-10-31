// src/features/marketplace/components/marketplace-page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "~/components/language-provider";
import { AuthModal } from "~/components/auth-modal";
import { TopUpModal } from "~/components/top-up-modal";
import { SettingsModal } from "~/components/settings-modal";
import { FloatingButtons } from "~/components/floating-buttons";
import { MarketplaceHeader } from "~/components/marketplace/marketplace-header";
import { MarketplaceHero } from "~/components/marketplace/marketplace-hero";
import { MarketplaceSearch } from "~/components/marketplace/marketplace-search";

import { MarketplacePromptContainer } from "~/components/marketplace/marketplace-prompt-container";
import { PromptDetailModal } from "~/components/prompt-detail-modal";
import { QuickActions } from "~/components/quick-actions";
import { UpdateBadge } from "~/components/update-badge";
import { SponsorBanner } from "~/components/sponsor-banner";
import { CategoryChips } from "~/components/category-chips";
import { useCredits } from "~/hooks/use-credits";
import { useMarketplaceFilters } from "~/hooks/use-marketplace-filters";
import { PLACEHOLDER_PROMPTS } from "~/lib/placeholder-data";
import type { QUICK_ACTIONS } from "~/lib/placeholder-data";
import type { MarketplacePageProps, ModalType } from "~/lib/types";
import type { Prompt } from "@prisma/client";

export function MarketplacePage({
  prompts: _prompts,
  lang,
}: MarketplacePageProps) {
  const translations = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Use placeholder data for development
  const allPrompts = PLACEHOLDER_PROMPTS;

  // Custom hooks for cleaner state management
  const { credits, refreshCredits } = useCredits();
  const { filters, filteredPrompts, setSearchQuery, setViewMode } =
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

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length === 2 && pathParts[0] === lang) {
        // We're on /[lang]/[id] - find and open the prompt
        const promptId = pathParts[1];
        const prompt = allPrompts.find((p) => p.id === promptId);
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

  // Side effects for floating button actions
  const handleGalleryIntent = () => {
    setViewMode("gallery");
  };

  const handleSavedIntent = () => {
    setViewMode("saved");
  };

  // Handle quick action clicks
  const handleQuickAction = async (action: (typeof QUICK_ACTIONS)[0]) => {
    // For now, just copy the prompt to clipboard
    try {
      await navigator.clipboard.writeText(action.prompt);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
    // Could also open a modal or navigate somewhere
  };

  // Handle sponsor banner CTA
  const handleSponsorCta = () => {
    openModal("topup");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Header */}
      <MarketplaceHeader credits={credits} onOpenModal={openModal} />

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <MarketplaceHero />

        {/* Quick Actions */}
        <QuickActions onActionClick={handleQuickAction} />

        {/* Search and Filters */}
        <section className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 py-6 backdrop-blur md:static md:bg-white/50">
          <div className="container-tight">
            <div className="mb-4 flex items-center justify-between">
              <MarketplaceSearch
                searchQuery={filters.searchQuery}
                onSearchChange={setSearchQuery}
              />
              <UpdateBadge lastUpdated={new Date()} />
            </div>
            <CategoryChips
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
            />
          </div>
        </section>

        {/* Prompts Container */}
        <MarketplacePromptContainer
          prompts={filteredPrompts}
          viewMode={filters.viewMode}
          onCreditsUpdate={refreshCredits}
          onShowAuthModal={() => openModal("auth")}
          onPromptClick={openPromptDetail}
        />
      </main>

      {/* Floating Buttons */}
      <FloatingButtons
        onGalleryClick={handleGalleryIntent}
        onSavedClick={handleSavedIntent}
        active={filters.viewMode}
        onModeChange={setViewMode}
      />

      {/* Sponsor Banner */}
      <section className="py-8">
        <div className="container-tight">
          <SponsorBanner onCtaClick={handleSponsorCta} />
        </div>
      </section>

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

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={closePromptDetail}
        onCreditsUpdate={refreshCredits}
      />
    </div>
  );
}
