// src/components/marketplace/marketplace-prompts.tsx

import { PromptCard } from "~/components/prompt-card";
import { PromptListItem } from "~/components/prompt-list-item";
import { PromptPhotoCard } from "~/components/prompt-photo-card";
import { EmptySearchState } from "./empty-search-state";
import { useSearchParams } from "next/navigation";
import { useMarketUI } from "~/stores/use-market-ui";
import type { Prompt } from "@prisma/client";

interface MarketplacePromptsProps {
  prompts: Prompt[];
  onCreditsUpdate: (credits: number) => void;
  onShowAuthModal: () => void;
  onPromptClick: (prompt: Prompt) => void;
  mode?: string;
}

export function MarketplacePrompts({
  prompts,
  onCreditsUpdate,
  onShowAuthModal,
  onPromptClick,
  mode: _mode,
}: MarketplacePromptsProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || undefined;
  const { mobileViewMode } = useMarketUI();

  // Show empty state when no prompts found
  if (prompts.length === 0) {
    return <EmptySearchState searchQuery={searchQuery} />;
  }

  // Mobile photo-only view
  if (mobileViewMode === "photo-only") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

  // Desktop grid view (default)
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
