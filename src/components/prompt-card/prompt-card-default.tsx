// Default/Full variant of prompt card

import { useCallback } from "react";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useTranslations } from "~/components/language-provider";
import { cn } from "~/lib/utils";
import { UI_CONSTANTS } from "~/lib/constants/ui";
import { useWebShare } from "~/hooks/use-web-share";
import { useBookmark } from "~/hooks/use-bookmark";
import { PromptImageSection, CategoryBadge } from "./shared-components";
import { ActionButtons } from "./action-buttons";
import type { BasePromptCardProps } from "./types";

export function PromptCardDefault({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
  reviewSafeImage,
}: BasePromptCardProps) {
  const translations = useTranslations();

  // Hooks for Share and Bookmark functionality
  const {
    share,
    status: shareStatus,
    clearStatus: clearShareStatus,
  } = useWebShare();
  const {
    isSaved,
    isLoading: isBookmarkLoading,
    toggleBookmark,
    status: bookmarkStatus,
    clearStatus: clearBookmarkStatus,
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

  return (
    <Card
      className={cn(
        "focus-visible:ring-brand-500/50 flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-0 transition-all hover:shadow-lg focus-visible:ring-2",
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
        bookmarkStatus={bookmarkStatus}
        shareStatus={shareStatus}
        onClearBookmarkStatus={clearBookmarkStatus}
        onClearShareStatus={clearShareStatus}
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
            "mx-3 mb-3 flex flex-1 flex-col rounded-lg border border-slate-300 bg-slate-50/50",
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
