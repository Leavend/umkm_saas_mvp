"use client";

import Image from "next/image";
import { Share2, Bookmark, Loader2, Send } from "lucide-react";
import { useCallback } from "react";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { Separator } from "~/components/ui/separator";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CopyButton } from "~/components/ui/copy-button";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";
import { UI_CONSTANTS } from "~/lib/constants/ui";
import { useWebShare } from "~/hooks/use-web-share";
import { useBookmark } from "~/hooks/use-bookmark";
import type { Prompt } from "@prisma/client";

type CardViewMode = "default" | "image-only" | "full-description";

interface PromptCardProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onClick?: (prompt: Prompt) => void;
  reviewSafeImage?: boolean;
  cardViewMode?: CardViewMode;
}

/**
 * Extract overlay buttons into a separate component
 */
interface OverlayButtonsProps {
  isSaved: boolean;
  isBookmarkLoading: boolean;
  onShare: (e: React.MouseEvent) => void;
  onBookmark: (e: React.MouseEvent) => void;
}

function OverlayButtons({
  isSaved,
  isBookmarkLoading,
  onShare,
  onBookmark,
}: OverlayButtonsProps) {
  return (
    <div className="absolute top-2 right-2 flex gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className={UI_CONSTANTS.component.button.icon}
        onClick={onShare}
        aria-label="Share prompt"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          UI_CONSTANTS.component.button.icon,
          isSaved &&
          "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
        )}
        onClick={onBookmark}
        disabled={isBookmarkLoading}
        aria-label={isSaved ? "Unsave prompt" : "Save prompt"}
      >
        {isBookmarkLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
        )}
      </Button>
    </div>
  );
}

/**
 * Extract category badge into a separate component
 */
interface CategoryBadgeProps {
  category: string;
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <div className="mb-3 flex flex-wrap gap-1 px-3">
      <Badge
        variant="secondary"
        className={cn(
          UI_CONSTANTS.colors.brand[100],
          UI_CONSTANTS.colors.brand[800],
          UI_CONSTANTS.component.badge.size,
        )}
      >
        {category}
      </Badge>
    </div>
  );
}

/**
 * Extract image section into a separate component
 */
interface PromptImageSectionProps {
  prompt: Prompt;
  reviewSafeImage?: boolean;
  isSaved: boolean;
  isBookmarkLoading: boolean;
  onShare: (e: React.MouseEvent) => void;
  onBookmark: (e: React.MouseEvent) => void;
}

function PromptImageSection({
  prompt,
  reviewSafeImage,
  isSaved,
  isBookmarkLoading,
  onShare,
  onBookmark,
}: PromptImageSectionProps) {
  const imageClasses = cn(
    "transition-transform group-hover:scale-105",
    reviewSafeImage ? "object-contain" : "object-cover",
  );

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-slate-100">
      <Image
        src={prompt.imageUrl}
        alt={prompt.title}
        fill
        className={imageClasses}
        loading="lazy"
        placeholder="blur"
        blurDataURL={UI_CONSTANTS.image.blurPlaceholder}
        sizes={UI_CONSTANTS.image.sizes.thumbnail}
      />
      <OverlayButtons
        isSaved={isSaved}
        isBookmarkLoading={isBookmarkLoading}
        onShare={onShare}
        onBookmark={onBookmark}
      />
    </div>
  );
}

/**
 * Extract action buttons into a separate component
 */
interface ActionButtonsProps {
  onClick?: (prompt: Prompt) => void;
  prompt: Prompt;
  onShowAuthModal?: () => void;
  onCreditsUpdate?: (credits: number) => void;
  translations: { common: { actions: { goToGenerate: string } } };
}

function ActionButtons({
  onClick,
  prompt,
  onShowAuthModal,
  onCreditsUpdate,
  translations,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5">
      <Button
        size="sm"
        variant="outline"
        className={cn(
          UI_CONSTANTS.component.button.sm,
          "flex-1 gap-1.5 text-[10px] sm:w-auto sm:flex-none sm:text-xs",
        )}
        onClick={() => onClick?.(prompt)}
      >
        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
        {translations.common.actions.goToGenerate}
      </Button>

      <CopyButton
        prompt={prompt}
        onCreditsUpdate={onCreditsUpdate}
        onShowAuthModal={onShowAuthModal}
        size="sm"
        className={cn(
          UI_CONSTANTS.component.button.sm,
          "flex-1 text-[10px] sm:w-auto sm:flex-none sm:text-xs",
        )}
        showText={false}
      />
    </div>
  );
}

export function PromptCard({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
  reviewSafeImage,
  cardViewMode,
}: PromptCardProps) {
  const translations = useTranslations();
  const { cardViewMode: globalCardViewMode } = useMarketUI();
  const currentCardViewMode = cardViewMode ?? globalCardViewMode;

  // Hooks for Share and Bookmark functionality
  const { share } = useWebShare();
  const {
    isSaved,
    isLoading: isBookmarkLoading,
    toggleBookmark,
  } = useBookmark({
    promptId: prompt.id,
  });

  // Handle share button click
  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      const currentUrl =
        typeof window !== "undefined" ? window.location.href : "";

      await share({
        title: prompt.title,
        text: prompt.text,
        url: currentUrl,
      });
    },
    [prompt, share],
  );

  // Handle bookmark button click
  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await toggleBookmark();
    },
    [toggleBookmark],
  );

  // Image-only mode
  if (currentCardViewMode === "image-only") {
    return (
      <Card
        className={cn(
          "group focus-visible:ring-brand-500/50 relative flex aspect-square h-full cursor-pointer overflow-hidden transition-all hover:shadow-lg focus-visible:ring-2",
          UI_CONSTANTS.colors.slate[200],
          "bg-white",
        )}
        onClick={() => onClick?.(prompt)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${prompt.title}`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={prompt.imageUrl}
            alt={prompt.title}
            fill
            className={cn(
              reviewSafeImage ? "object-contain" : "object-cover",
              "object-center transition-transform group-hover:scale-105",
            )}
            loading="lazy"
            placeholder="blur"
            blurDataURL={UI_CONSTANTS.image.blurPlaceholder}
            sizes={UI_CONSTANTS.image.sizes.card}
          />
          <Badge
            className={cn(
              "absolute top-2 right-2 text-xs text-slate-900 sm:text-sm",
              UI_CONSTANTS.colors.brand[500],
            )}
          >
            {prompt.category}
          </Badge>
        </div>
      </Card>
    );
  }

  // Full card mode
  return (
    <Card
      className={cn(
        "focus-visible:ring-brand-500/50 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 transition-all hover:shadow-lg focus-visible:ring-2",
      )}
      tabIndex={0}
      role="group"
      aria-label={`Prompt card for ${prompt.title}`}
    >
      {/* Image Section */}
      <PromptImageSection
        prompt={prompt}
        reviewSafeImage={reviewSafeImage}
        isSaved={isSaved}
        isBookmarkLoading={isBookmarkLoading}
        onShare={handleShare}
        onBookmark={handleBookmark}
      />

      {/* Content Section */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          UI_CONSTANTS.layout.spacing.xs,
          "pt-1.5 sm:pt-2",
        )}
      >
        {/* Category Badge */}
        <CategoryBadge category={prompt.category} />

        {/* Description Container */}
        <div
          className={cn(
            "mx-3 mb-3 flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-300 bg-slate-50/50",
          )}
        >
          {/* Scrollable Text */}
          <div
            className={cn(
              "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 h-24 overflow-y-auto p-3",
            )}
          >
            <p className="font-rubik text-sm text-slate-800">{prompt.text}</p>
          </div>

          <Separator className="my-0 bg-slate-300" />

          {/* Action Buttons */}
          <ActionButtons
            onClick={onClick}
            prompt={prompt}
            onShowAuthModal={onShowAuthModal}
            onCreditsUpdate={onCreditsUpdate}
            translations={translations}
          />
        </div>
      </div>
    </Card>
  );
}
