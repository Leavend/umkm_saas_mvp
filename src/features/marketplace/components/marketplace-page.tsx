// src/features/marketplace/components/marketplace-page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthModal } from "~/components/auth-modal";
import { TopUpModal } from "~/components/top-up-modal";
import { SettingsModal } from "~/components/settings-modal";
import { FloatingButtons } from "~/components/floating-buttons";
import { MobileFabDock } from "~/components/mobile-fab-dock";
import { useMarketUI } from "~/stores/use-market-ui";
import { Container } from "~/components/container";
import { MarketplaceHeader } from "~/components/marketplace/marketplace-header";
import { MarketplaceHero } from "~/components/marketplace/marketplace-hero";

import { MarketplacePromptContainer } from "~/components/marketplace/marketplace-prompt-container";
import { PromptDetailModal } from "~/components/prompt-detail-modal";
import { QuickStartPills } from "~/components/quick-start-pills";
import { SponsorBanner } from "~/components/sponsor-banner";
import { MarketplaceFilterBar } from "~/components/marketplace/marketplace-filter-bar";
import { useCredits } from "~/hooks/use-credits";
import { useMarketplaceFilters } from "~/hooks/use-marketplace-filters";
import { PLACEHOLDER_PROMPTS } from "~/lib/placeholder-data";
import type { MarketplacePageProps, ModalType } from "~/lib/types";
import type { Prompt } from "@prisma/client";

export function MarketplacePage({
  prompts: _prompts,
  lang,
}: MarketplacePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mode, setMode } = useMarketUI();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Use placeholder data for development
  const allPrompts = PLACEHOLDER_PROMPTS;

  // Custom hooks for cleaner state management
  const { credits, refreshCredits } = useCredits();
  const { filters, filteredPrompts, setSearchQuery } =
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
      setSelectedCategories([categoryParam]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write mode and category to URL when they change
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (mode === "browse") {
      params.delete("mode");
    } else {
      params.set("mode", mode);
    }

    // Set category parameter
    if (selectedCategories.length > 0 && selectedCategories[0]) {
      params.set("category", selectedCategories[0]);
    } else {
      params.delete("category");
    }

    const newUrl = params.toString() ? `?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [mode, selectedCategories, searchParams, router, pathname]);

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

  // Handle quick start pill selection
  const handleQuickSelect = (id: string) => {
    // Map quick start IDs to the placeholder data
    const quickStartMap: Record<string, string> = {
      "mens-portrait": "mens-portrait",
      "womens-portrait": "womens-portrait",
      "sunset-landscape": "sunset-landscape",
      "modern-building": "modern-building",
    };

    // Find the corresponding prompt and open it
    const prompt = allPrompts.find((p) => p.id === quickStartMap[id]);
    if (prompt) {
      openPromptDetail(prompt);
    }
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
      <main className="flex-1">
        {/* Hero Section */}
        <MarketplaceHero />

        {/* Quick Start */}
        <section className="mt-6 md:mt-8">
          <Container>
            <QuickStartPills onSelect={handleQuickSelect} />
          </Container>
        </section>
      </main>

      {/* Sticky Filter Bar */}
      <MarketplaceFilterBar
        searchQuery={filters.searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        lastUpdated={new Date()}
      />

      {/* Prompts Container */}
      <MarketplacePromptContainer
        prompts={filteredPrompts}
        mode={mode}
        onCreditsUpdate={refreshCredits}
        onShowAuthModal={() => openModal("auth")}
        onPromptClick={openPromptDetail}
      />

      {/* Desktop Floating Buttons */}
      <FloatingButtons />

      {/* Mobile FAB Dock */}
      <MobileFabDock />

      {/* Sponsor Banner */}
      <section className="mt-6 pb-28 md:pb-0">
        <Container>
          <SponsorBanner onCtaClick={handleSponsorCta} />
        </Container>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <Container className="flex flex-col items-center gap-2 py-6 text-sm text-slate-600 md:flex-row md:justify-between">
          <span>? {new Date().getFullYear()} Prompt Store.</span>
          <nav className="flex items-center gap-4">
            <Link
              className="focus-visible:ring-brand-500/50 rounded hover:underline focus:outline-none focus-visible:ring-2"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="focus-visible:ring-brand-500/50 rounded hover:underline focus:outline-none focus-visible:ring-2"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="focus-visible:ring-brand-500/50 rounded hover:underline focus:outline-none focus-visible:ring-2"
              href="/contact"
            >
              Contact
            </Link>
          </nav>
        </Container>
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
