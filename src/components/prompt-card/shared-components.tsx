// Shared sub-components for prompt cards

import Image from "next/image";
import { useState, useRef } from "react";
import { Share2, Bookmark, Loader2, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ActionToast } from "~/components/ui/action-toast";
import { cn } from "~/lib/utils";
import { UI_CONSTANTS } from "~/lib/constants/ui";
import type { Prompt } from "@prisma/client";

// Overlay Buttons Component
interface OverlayButtonsProps {
  isSaved: boolean;
  isBookmarkLoading: boolean;
  onShare: (e: React.MouseEvent) => void;
  onBookmark: (e: React.MouseEvent) => void;
  bookmarkStatus?: "idle" | "saved" | "removed" | "error";
  shareStatus?: "idle" | "shared" | "error";
  onClearBookmarkStatus?: () => void;
  onClearShareStatus?: () => void;
}

export function OverlayButtons({
  isSaved,
  isBookmarkLoading,
  onShare,
  onBookmark,
  bookmarkStatus = "idle",
  shareStatus = "idle",
  onClearBookmarkStatus,
  onClearShareStatus,
}: OverlayButtonsProps) {
  const showBookmarkToast =
    bookmarkStatus === "saved" || bookmarkStatus === "removed";
  const showShareToast = shareStatus === "shared";

  return (
    <div className="absolute top-2 right-2 flex gap-1.5">
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className={UI_CONSTANTS.component.button.icon}
          onClick={onShare}
          aria-label="Share prompt"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <ActionToast
          show={showShareToast}
          variant="shared"
          onDismiss={() => onClearShareStatus?.()}
        />
      </div>
      <div className="relative">
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
        <ActionToast
          show={showBookmarkToast}
          variant={bookmarkStatus === "saved" ? "saved" : "removed"}
          onDismiss={() => onClearBookmarkStatus?.()}
        />
      </div>
    </div>
  );
}

// Category Badge Component
interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
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

// Prompt Image Section Component
interface PromptImageSectionProps {
  prompt: Prompt;
  reviewSafeImage?: boolean;
  isSaved: boolean;
  isBookmarkLoading: boolean;
  onShare: (e: React.MouseEvent) => void;
  onBookmark: (e: React.MouseEvent) => void;
  bookmarkStatus?: "idle" | "saved" | "removed" | "error";
  shareStatus?: "idle" | "shared" | "error";
  onClearBookmarkStatus?: () => void;
  onClearShareStatus?: () => void;
}

export function PromptImageSection({
  prompt,
  reviewSafeImage,
  isSaved,
  isBookmarkLoading,
  onShare,
  onBookmark,
  bookmarkStatus,
  shareStatus,
  onClearBookmarkStatus,
  onClearShareStatus,
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
        bookmarkStatus={bookmarkStatus}
        shareStatus={shareStatus}
        onClearBookmarkStatus={onClearBookmarkStatus}
        onClearShareStatus={onClearShareStatus}
      />
    </div>
  );
}
