"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { Badge } from "~/components/ui/badge";
import { copyPrompt } from "~/actions/prompts";
import { useMarketUI } from "~/stores/use-market-ui";
import type { Prompt } from "@prisma/client";

interface PromptListItemProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onClick?: (prompt: Prompt) => void;
  cardViewMode?: "default" | "image-only" | "full-description";
}

export function PromptListItem({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
  cardViewMode,
}: PromptListItemProps) {
  const translations = useTranslations();
  const { cardViewMode: globalCardViewMode } = useMarketUI();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const currentCardViewMode = cardViewMode ?? globalCardViewMode;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);

      const result = await copyPrompt(prompt.id);

      if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : result.error.message;
        toast.error(errorMessage);
        if (typeof result.error === 'string' && result.error.includes("Insufficient credits") && onShowAuthModal) {
          onShowAuthModal();
        }
        return;
      }

      await navigator.clipboard.writeText(result.prompt.text);

      if (onCreditsUpdate) {
        onCreditsUpdate(result.remainingCredits);
      }

      setIsCopied(true);
      toast.success(translations.promptCard.copiedToClipboard, {
        description: `${result.remainingCredits} ${translations.promptCard.creditsRemaining}`,
      });

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      toast.error(translations.promptCard.copyFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`group focus-visible:ring-brand-500/50 relative flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:shadow-md focus-visible:ring-2 sm:gap-4 sm:p-4 ${
        currentCardViewMode === "full-description" ? "flex-col" : ""
      }`}
      onClick={() => onClick?.(prompt)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${prompt.title}`}
    >
      {/* Thumbnail */}
      <div className={`relative flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 ${
        currentCardViewMode === "full-description" 
          ? "h-48 w-full sm:h-64" 
          : "h-16 w-16 sm:h-20 sm:w-20"
      }`}>
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className="object-cover object-center"
          sizes={currentCardViewMode === "full-description" ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" : "(max-width: 640px) 64px, 80px"}
        />
        <Badge className="bg-brand-500 absolute top-2 right-2 text-xs text-slate-900 sm:text-sm">
          {prompt.category}
        </Badge>
      </div>

      {/* Content */}
      <div className={`min-w-0 flex-1 ${currentCardViewMode === "full-description" ? "w-full" : ""}`}>
        <div className={`flex items-start justify-between gap-2 ${
          currentCardViewMode === "full-description" ? "flex-col gap-3" : ""
        }`}>
          <div className={`min-w-0 flex-1 ${currentCardViewMode === "full-description" ? "text-center" : ""}`}>
            <h3 className={`line-clamp-1 font-semibold text-slate-900 ${
              currentCardViewMode === "full-description" ? "text-base sm:text-lg mb-2" : "text-sm sm:text-base"
            }`}>
              {prompt.title}
            </h3>
            <p className={`text-slate-600 ${
              currentCardViewMode === "full-description" 
                ? "text-sm sm:text-base" 
                : "mt-1 line-clamp-1 text-xs sm:line-clamp-2 sm:text-sm"
            }`}>
              {prompt.text}
            </p>
          </div>
          {currentCardViewMode !== "full-description" && (
            <Badge className="bg-brand-500 flex-shrink-0 text-xs text-slate-900 sm:text-sm">
              {prompt.category}
            </Badge>
          )}
        </div>
      </div>

      {/* Action */}
      <Button
        className={`focus-visible:ring-brand-500/50 flex-shrink-0 gap-2 rounded-md px-2 py-2 text-xs focus-visible:ring-2 sm:px-3 sm:py-2 sm:text-sm ${
          isCopied
            ? "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-slate-900"
            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        }`}
        disabled={isLoading || isCopied}
        onClick={handleCopy}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
        ) : isCopied ? (
          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : (
          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
        )}
        <span className="ml-1 hidden sm:inline">Copy</span>
      </Button>
    </div>
  );
}
