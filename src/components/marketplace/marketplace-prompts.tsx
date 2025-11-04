// src/components/marketplace/marketplace-prompts.tsx

import { Search } from "lucide-react";
import { PromptCard } from "~/components/prompt-card";
import { PromptListItem } from "~/components/prompt-list-item";
import { PromptPhotoCard } from "~/components/prompt-photo-card";
import { useTranslations } from "~/components/language-provider";
import { useMarketUI } from "~/stores/use-market-ui";
import type { Prompt } from "@prisma/client";

interface MarketplacePromptsProps {
  prompts: Prompt[];
  onCreditsUpdate: (credits: number) => void;
  onShowAuthModal: () => void;
  onPromptClick: (prompt: Prompt) => void;
  view?: "grid" | "list";
  mode?: string;
}

export function MarketplacePrompts({
  prompts,
  onCreditsUpdate,
  onShowAuthModal,
  onPromptClick,
  view = "grid",
  mode: _mode,
}: MarketplacePromptsProps) {
  const translations = useTranslations();
  const { mobileViewMode } = useMarketUI();

  if (prompts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Search className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-500 md:text-base">
            {translations.marketplace.noPromptsFound}
          </p>
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="flex flex-col gap-3">
        {prompts.map((prompt) => (
          <PromptListItem
            key={prompt.id}
            prompt={prompt}
            onCreditsUpdate={onCreditsUpdate}
            onShowAuthModal={onShowAuthModal}
            onClick={onPromptClick}
          />
        ))}
      </div>
    );
  }

  // Mobile photo-only view
  if (mobileViewMode === "photo-only") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {prompts.map((prompt) => (
          <PromptPhotoCard
            key={prompt.id}
            prompt={prompt}
            onCreditsUpdate={onCreditsUpdate}
            onShowAuthModal={onShowAuthModal}
            onClick={onPromptClick}
          />
        ))}
      </div>
    );
  }

  // Default grid view
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onCreditsUpdate={onCreditsUpdate}
          onShowAuthModal={onShowAuthModal}
          onClick={onPromptClick}
        />
      ))}
    </div>
  );
}
