"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { copyPrompt } from "~/actions/prompts";
import { useTranslations } from "~/components/language-provider";
import type { Prompt } from "@prisma/client";

interface UsePromptCopyOptions {
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
}

interface UsePromptCopyReturn {
  isLoading: boolean;
  isCopied: boolean;
  copyPrompt: (prompt: Prompt, event?: React.MouseEvent) => Promise<void>;
}

/**
 * Custom hook for handling prompt copy functionality
 * Encapsulates copy logic, loading states, and error handling
 */
export function usePromptCopy({
  onCreditsUpdate,
  onShowAuthModal,
}: UsePromptCopyOptions = {}): UsePromptCopyReturn {
  const translations = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(
    async (prompt: Prompt, event?: React.MouseEvent) => {
      event?.stopPropagation();
      
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

          // Check for insufficient credits error
          const isInsufficientCredits =
            result.error &&
            ((typeof result.error !== "string" &&
              result.error.code === "INSUFFICIENT_CREDITS") ||
              (typeof result.error === "string" &&
                result.error.includes("Insufficient credits")));

          if (isInsufficientCredits && onShowAuthModal) {
            onShowAuthModal();
          }
          return;
        }

        // Copy to clipboard
        await navigator.clipboard.writeText(result.data?.prompt.text ?? "");

        // Update credits if available
        if (onCreditsUpdate && result.data?.remainingCredits) {
          onCreditsUpdate(result.data.remainingCredits);
        }

        // Show success state
        setIsCopied(true);
        toast.success(translations.promptCard.copiedToClipboard, {
          description: `${result.data?.remainingCredits ?? 0} ${translations.promptCard.creditsRemaining}`,
        });

        // Reset copied state after delay
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (error) {
        console.error("Failed to copy prompt:", error);
        toast.error(translations.promptCard.copyFailed);
      } finally {
        setIsLoading(false);
      }
    },
    [translations, onCreditsUpdate, onShowAuthModal],
  );

  return {
    isLoading,
    isCopied,
    copyPrompt: handleCopy,
  };
}