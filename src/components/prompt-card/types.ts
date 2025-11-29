// Shared types for prompt card variants

import type { Prompt } from "@prisma/client";

export type CardViewMode = "default" | "image-only" | "full-description";

export interface BasePromptCardProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onClick?: (prompt: Prompt) => void;
  reviewSafeImage?: boolean;
}

export interface PromptCardProps extends BasePromptCardProps {
  cardViewMode?: CardViewMode;
}
