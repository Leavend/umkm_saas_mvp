// Main prompt card component with variant selection

"use client";

import { useEffect } from "react";
import { useMarketUI } from "~/stores/use-market-ui";
import { PromptCardDefault } from "./prompt-card/prompt-card-default";
import { PromptCardImageOnly } from "./prompt-card/prompt-card-image-only";
import { trackPromptViewed } from "~/lib/analytics-helpers";
import type { PromptCardProps } from "./prompt-card/types";

export function PromptCard({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
  reviewSafeImage,
  cardViewMode,
}: PromptCardProps) {
  const { cardViewMode: globalCardViewMode } = useMarketUI();
  const currentCardViewMode = cardViewMode ?? globalCardViewMode;

  // Track prompt view
  useEffect(() => {
    trackPromptViewed(prompt.id, prompt.category);
  }, [prompt.id, prompt.category]);

  // Image-only mode
  if (currentCardViewMode === "image-only") {
    return (
      <PromptCardImageOnly
        prompt={prompt}
        onClick={onClick}
        reviewSafeImage={reviewSafeImage}
        onCreditsUpdate={onCreditsUpdate}
        onShowAuthModal={onShowAuthModal}
      />
    );
  }

  // Default variant (full card with image + description + action buttons)
  return (
    <div data-testid="prompt-card" data-prompt-id={prompt.id}>
      <PromptCardDefault
        prompt={prompt}
        onCreditsUpdate={onCreditsUpdate}
        onShowAuthModal={onShowAuthModal}
        onClick={onClick}
        reviewSafeImage={reviewSafeImage}
      />
    </div>
  );
}
