"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
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
 * Copies prompt text directly to clipboard without credit deduction
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

        // Copy to clipboard directly (no server call, no credit deduction)
        await navigator.clipboard.writeText(prompt.text);

        // Show success state
        setIsCopied(true);
        toast.success(translations.promptCard.copiedToClipboard);

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
    [translations],
  );

  return {
    isLoading,
    isCopied,
    copyPrompt: handleCopy,
  };
}
