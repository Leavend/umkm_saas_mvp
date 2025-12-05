"use client";

import { useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePromptCopy } from "~/hooks/use-prompt-copy";
import { useWebShare } from "~/hooks/use-web-share";
import { useBookmark } from "~/hooks/use-bookmark";
import { useTranslations } from "~/components/language-provider";
import type { Prompt } from "@prisma/client";
import { PromptImageSection } from "./prompt-detail/prompt-image-section";
import { PromptInfoSection } from "./prompt-detail/prompt-info-section";

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCreditsUpdate?: (credits: number) => void;
  allPrompts?: Prompt[];
  onNavigate?: (sequenceNumber: number) => void;
  onShowAuthModal?: () => void;
}

export function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
  onCreditsUpdate,
  allPrompts = [],
  onNavigate,
}: PromptDetailModalProps) {
  const translations = useTranslations();
  const { isLoading, status, clearStatus, copyPrompt } = usePromptCopy({
    onCreditsUpdate,
  });
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
    promptId: prompt?.id ?? "",
  });

  // Navigation logic
  const currentIndex = prompt
    ? allPrompts.findIndex((p) => p.id === prompt.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allPrompts.length - 1;

  const handlePrevious = useCallback(() => {
    if (hasPrev && onNavigate) {
      onNavigate(allPrompts[currentIndex - 1]!.sequenceNumber);
    }
  }, [hasPrev, onNavigate, allPrompts, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(allPrompts[currentIndex + 1]!.sequenceNumber);
    }
  }, [hasNext, onNavigate, allPrompts, currentIndex]);

  const handleCopy = useCallback(() => {
    if (prompt) {
      void copyPrompt(prompt);
    }
  }, [prompt, copyPrompt]);

  const handleShare = useCallback(async () => {
    if (!prompt) return;
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    await share({
      title: prompt.title,
      text: prompt.text,
      url: currentUrl,
    });
  }, [prompt, share]);

  const handleBookmark = useCallback(async () => {
    await toggleBookmark();
  }, [toggleBookmark]);

  const handleGenerate = useCallback(() => {
    // TODO: Implement generate feature
  }, []);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearStatus();
    }
  }, [isOpen, clearStatus]);

  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl gap-0 overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>{prompt.title}</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-col md:flex-row">
          <PromptImageSection
            imageUrl={prompt.imageUrl}
            title={prompt.title}
            hasPrev={hasPrev}
            hasNext={hasNext}
            isLoading={isLoading}
            isSaved={isSaved}
            isBookmarkLoading={isBookmarkLoading}
            shareStatus={shareStatus}
            bookmarkStatus={bookmarkStatus}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onClearShareStatus={clearShareStatus}
            onClearBookmarkStatus={clearBookmarkStatus}
          />

          <PromptInfoSection
            title={prompt.title}
            category={prompt.category}
            text={prompt.text}
            sequenceNumber={prompt.sequenceNumber}
            isLoading={isLoading}
            status={status}
            translations={translations}
            onClose={onClose}
            onGenerate={handleGenerate}
            onCopy={handleCopy}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


