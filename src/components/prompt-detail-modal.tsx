"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Copy, Check, Clock, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useTranslations } from "~/components/language-provider";
import { copyPrompt } from "~/actions/prompts";
import type { Prompt } from "@prisma/client";

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCreditsUpdate?: (credits: number) => void;
}

export function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
  onCreditsUpdate,
}: PromptDetailModalProps) {
  const translations = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!prompt) return;

    try {
      setIsLoading(true);

      const result = await copyPrompt(prompt.id);

      if (!result.success) {
        const errorMessage = result.error
          ? typeof result.error === "string"
            ? result.error
            : result.error.message
          : "An error occurred";
        toast.error(errorMessage);
        return;
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(result.data?.prompt.text ?? "");

      // Update credits display
      if (onCreditsUpdate && result.data?.remainingCredits) {
        onCreditsUpdate(result.data.remainingCredits);
      }

      // Show success feedback
      setIsCopied(true);
      toast.success(translations.promptCard.copiedToClipboard, {
        description: `${result.data?.remainingCredits ?? 0} ${translations.promptCard.creditsRemaining}`,
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

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 max-h-[90vh] max-w-4xl gap-0 overflow-y-auto p-0 sm:mx-0">
        <DialogHeader className="p-4 pb-0 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="pr-8 text-xl font-bold break-words text-slate-900 sm:text-2xl">
                {prompt.title}
              </DialogTitle>
              <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4 flex-shrink-0" />
                  <Badge
                    variant="secondary"
                    className="bg-brand-100 text-brand-800 text-xs sm:text-sm"
                  >
                    {prompt.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">
                    {new Date(prompt.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 flex-shrink-0 rounded-full hover:bg-slate-100"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          {/* Image */}
          <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg bg-slate-100 sm:mb-6 sm:h-64 md:h-80">
            <Image
              src={prompt.imageUrl}
              alt={prompt.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) calc(100vw - 3rem), (max-width: 1024px) calc(100vw - 3rem), 896px"
            />
          </div>

          {/* Description */}
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
              {prompt.text}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row">
            <Button
              className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500/50 w-full gap-2 text-slate-900 sm:flex-1"
              disabled={isLoading || isCopied}
              onClick={handleCopy}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  <span className="hidden sm:inline">
                    {translations.promptCard.copying}
                  </span>
                  <span className="sm:hidden">
                    {translations.promptCard.copying}
                  </span>
                </>
              ) : isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {translations.promptCard.copied}
                  </span>
                  <span className="sm:hidden">
                    {translations.promptCard.copied}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {translations.promptCard.copyPrompt}
                  </span>
                  <span className="sm:hidden">
                    {translations.promptCard.copyPrompt}
                  </span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="focus-visible:ring-brand-500/50 w-full px-6 sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
