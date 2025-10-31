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
        toast.error(result.error);
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

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="pr-8 text-2xl font-bold text-slate-900">
                {prompt.title}
              </DialogTitle>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <Badge
                    variant="secondary"
                    className="bg-brand-100 text-brand-800"
                  >
                    {prompt.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last updated:{" "}
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

        <div className="px-6 pb-6">
          {/* Image */}
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg bg-slate-100 md:h-80">
            <Image
              src={prompt.imageUrl}
              alt={prompt.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Description
            </h3>
            <p className="leading-relaxed text-slate-700">{prompt.text}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-slate-200 pt-4">
            <Button
              className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500/50 flex-1 gap-2 text-slate-900"
              disabled={isLoading || isCopied}
              onClick={handleCopy}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  {translations.promptCard.copying}
                </>
              ) : isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  {translations.promptCard.copied}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {translations.promptCard.copyPrompt}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="focus-visible:ring-brand-500/50 px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
