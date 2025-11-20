// src/features/marketplace/components/marketplace-page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
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
import { MobileFabDock } from "~/components/mobile-fab-dock";
import { useMarketUI } from "~/stores/use-market-ui";
import { useMarketplaceFilters } from "~/hooks/use-marketplace-filters";
import { useCredits } from "~/hooks/use-credits";
import { useIsMobile } from "~/hooks/use-mobile";
import { useSession } from "~/lib/auth-client";
import type { ModalType } from "~/lib/types";
import type { Prompt } from "@prisma/client";
import { PLACEHOLDER_PROMPTS } from "~/lib/placeholder-data";

interface MarketplacePageProps {
  prompts: Prompt[];
  lang: string;
}

/**
 * Extract routing logic into a custom hook for better separation of concerns
 */
function useMarketplaceRouting(
  lang: string,
  allPrompts: Prompt[],
  setSelectedPrompt: (prompt: Prompt | null) => void,
) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToPrompt = useCallback(
    (promptId: string) => {
      router.push(`/${lang}/${promptId}`, { scroll: false });
    },
    [router, lang],
  );

  const navigateToHome = useCallback(() => {
    router.push(`/${lang}`, { scroll: false });
  }, [router, lang]);

  const handleRouteChange = useCallback(() => {
    const pathParts = pathname.split("/").filter(Boolean);

    if (pathParts.length === 2 && pathParts[0] === lang) {
      const promptId = pathParts[1];
      const prompt = allPrompts.find((p) => p.id === promptId);
      if (prompt) {
        setSelectedPrompt(prompt);
      }
    } else if (pathParts.length === 1 && pathParts[0] === lang) {
      setSelectedPrompt(null);
    }
  }, [pathname, lang, allPrompts, setSelectedPrompt]);

  useEffect(() => {
    handleRouteChange();
  }, [handleRouteChange]);

  return { navigateToPrompt, navigateToHome, handleRouteChange };
}

interface SessionData {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string | null;
  } | null;
}

/**
 * Extract modal state management into a custom hook
 */
function useModalState(
  session: SessionData | null,
  setActiveModal: (modal: ModalType | null) => void,
) {
  const openModal = useCallback(
    (modal: ModalType) => {
      // Only open auth modal if user is not authenticated
      if (modal === "auth" && session?.user) {
        // User already authenticated
        return;
      }
      setActiveModal(modal);
    },
    [session?.user, setActiveModal],
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, [setActiveModal]);

  // Auto-close auth modal when user successfully logs in
  useEffect(() => {
    if (session?.user) {
      closeModal();
    }
  }, [session?.user, closeModal]);

  return { openModal, closeModal };
}

/**
 * Extract URL sync logic into a custom hook
 */
function useUrlSync(
  setMode: (mode: "browse" | "gallery" | "saved" | null) => void,
  setSelectedCategory: (category: string) => void,
) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Sync mode with URL on mount
    const modeParam = searchParams.get("mode");
    if (modeParam === "gallery" || modeParam === "saved") {
      setMode(modeParam);
    }

    // Sync category with URL on mount
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, setMode, setSelectedCategory]);
}

export function MarketplacePage({
  prompts: _prompts,
  lang,
}: MarketplacePageProps) {
  const { mode, setMode, setMobileViewMode } = useMarketUI();
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Device-specific view mode setup
  useEffect(() => {
    if (isMobile) {
      setMobileViewMode("photo-only"); // Grid view for mobile
    } else {
      setMobileViewMode("default"); // List view for desktop
    }
  }, [isMobile, setMobileViewMode]);

  // Use placeholder data for development
  const allPrompts = PLACEHOLDER_PROMPTS;

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
      navigateToPrompt(prompt.id);
    },
    [setSelectedPrompt, navigateToPrompt],
  );

  const handleClosePromptDetail = useCallback(() => {
    setSelectedPrompt(null);
    navigateToHome();
  }, [setSelectedPrompt, navigateToHome]);

  // Render mode-specific content
  const renderMarketplaceContent = useCallback(() => {
    const commonProps = {
      prompts: [],
      onCreditsUpdate: refreshCredits,
      onShowAuthModal: () => openModal("auth"),
      onPromptClick: handlePromptClick,
    };

    switch (mode) {
      case null:
      case "browse":
      case "gallery":
        return <MarketplaceGallery {...commonProps} />;
      case "saved":
        return <MarketplaceSaved {...commonProps} />;
      default:
        return (
          <MarketplacePromptContainer
            prompts={filteredPrompts}
            mode={mode}
            onCreditsUpdate={refreshCredits}
            onShowAuthModal={() => openModal("auth")}
            onPromptClick={handlePromptClick}
          />
        );
    }
  }, [mode, filteredPrompts, refreshCredits, openModal, handlePromptClick]);

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
        onCreditsUpdate={refreshCredits}
      />

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={handleClosePromptDetail}
        onCreditsUpdate={refreshCredits}
      />

      <MobileFabDock />
    </div>
  );
}
