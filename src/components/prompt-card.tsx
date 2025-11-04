"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { copyPrompt } from "~/actions/prompts";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";
import type { Prompt } from "@prisma/client";

interface PromptCardProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onClick?: (prompt: Prompt) => void;
  reviewSafeImage?: boolean;
  cardViewMode?: "default" | "image-only" | "full-description";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const currentCardViewMode = cardViewMode ?? globalCardViewMode;

  const handleCopy = async () => {
    try {
      setIsLoading(true);

      const result = await copyPrompt(prompt.id);

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error.message;
        toast.error(errorMessage);
        // If insufficient credits and we have a callback to show auth modal, use it
        if (
          typeof result.error === "string" &&
          result.error.includes("Insufficient credits") &&
          onShowAuthModal
        ) {
          onShowAuthModal();
        }
        return;
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(result.prompt.text);

      // Update credits display
      if (onCreditsUpdate) {
        onCreditsUpdate(result.remainingCredits);
      }

      // Show success feedback
      setIsCopied(true);
      toast.success(translations.promptCard.copiedToClipboard, {
        description: `${result.remainingCredits} ${translations.promptCard.creditsRemaining}`,
      });

      // Reset copied state after 2 seconds
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
    <Card
      className={`group focus-visible:ring-brand-500/50 relative flex h-full cursor-pointer overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-lg focus-visible:ring-2 ${
        currentCardViewMode === "image-only" ? "aspect-square" : "flex-col"
      }`}
      onClick={() => onClick?.(prompt)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${prompt.title}`}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden",
          currentCardViewMode === "image-only"
            ? "h-full w-full rounded-2xl bg-slate-100"
            : "aspect-[4/3] rounded-t-2xl bg-slate-100",
        )}
      >
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className={`${reviewSafeImage ? "object-contain" : "object-cover"} object-center transition-transform group-hover:scale-105`}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <Badge className="bg-brand-500 absolute top-2 right-2 text-xs text-slate-900 sm:text-sm">
          {prompt.category}
        </Badge>
      </div>

      {/* Content - Hidden for image-only mode */}
      {currentCardViewMode !== "image-only" && (
        <CardHeader
          className={`flex-1 ${currentCardViewMode === "full-description" ? "p-4 sm:p-6" : "p-3 sm:p-4"}`}
        >
          <CardTitle
            className={`line-clamp-1 leading-tight font-semibold [text-wrap:balance] text-slate-800 ${currentCardViewMode === "full-description" ? "text-base sm:text-lg" : "text-sm sm:text-base md:text-lg"}`}
          >
            {prompt.title}
          </CardTitle>
          <CardDescription
            className={`mt-1 text-slate-600 ${currentCardViewMode === "full-description" ? "line-clamp-none text-sm sm:text-base" : "line-clamp-2 text-xs sm:text-sm"}`}
          >
            {prompt.text}
          </CardDescription>
        </CardHeader>
      )}

      {/* Footer with Copy Button - Hidden for image-only mode */}
      {currentCardViewMode !== "image-only" && (
        <CardFooter
          className={`rounded-xl border border-slate-200 ${currentCardViewMode === "full-description" ? "p-4 sm:p-6" : "p-3 sm:p-4"}`}
        >
          <Button
            className={`focus-visible:ring-brand-500/50 w-full gap-2 rounded-md px-3 py-2 text-xs focus-visible:ring-2 sm:text-sm ${
              isCopied
                ? "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-slate-900"
                : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
            disabled={isLoading || isCopied}
            onClick={handleCopy}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {translations.promptCard.copying}
                </span>
                <span className="sm:hidden">
                  {translations.promptCard.copying}
                </span>
              </>
            ) : isCopied ? (
              <>
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {translations.promptCard.copied}
                </span>
                <span className="sm:hidden">
                  {translations.promptCard.copied}
                </span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {translations.promptCard.copyPrompt}
                </span>
                <span className="sm:hidden">
                  {translations.promptCard.copyPrompt}
                </span>
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
