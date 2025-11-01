"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { Badge } from "~/components/ui/badge";
import { copyPrompt } from "~/actions/prompts";
import type { Prompt } from "@prisma/client";

interface PromptListItemProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onClick?: (prompt: Prompt) => void;
}

export function PromptListItem({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
}: PromptListItemProps) {
  const translations = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);

      const result = await copyPrompt(prompt.id);

      if (!result.success) {
        toast.error(result.error);
        if (result.error.includes("Insufficient credits") && onShowAuthModal) {
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
      className="group focus-visible:ring-brand-500/50 relative flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md focus-visible:ring-2"
      onClick={() => onClick?.(prompt)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${prompt.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className="object-cover object-center"
          loading="lazy"
          sizes="80px"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
              {prompt.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {prompt.text}
            </p>
          </div>
          <Badge className="bg-brand-500 flex-shrink-0 text-slate-900">
            {prompt.category}
          </Badge>
        </div>
      </div>

      {/* Action */}
      <Button
        className={`focus-visible:ring-brand-500/50 flex-shrink-0 gap-2 rounded-md px-3 py-2 text-sm focus-visible:ring-2 ${
          isCopied
            ? "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-slate-900"
            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        }`}
        disabled={isLoading || isCopied}
        onClick={handleCopy}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
