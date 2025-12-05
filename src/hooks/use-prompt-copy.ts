"use client";

import { useState, useCallback } from "react";
import type { Prompt } from "@prisma/client";
import { copyPrompt as copyPromptAction } from "~/actions/prompts";
import { toast } from "sonner";
import { useTranslations } from "~/components/language-provider";

interface UsePromptCopyOptions {
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
}

type CopyStatus = "idle" | "copied" | "error";

interface UsePromptCopyReturn {
  isLoading: boolean;
  status: CopyStatus;
  clearStatus: () => void;
  copyPrompt: (prompt: Prompt, event?: React.MouseEvent) => Promise<void>;
}

/**
 * Prompt copy hook - handles credit deduction and clipboard copy
 */
export function usePromptCopy({
  onCreditsUpdate,
  onShowAuthModal,
}: UsePromptCopyOptions = {}): UsePromptCopyReturn {
  const translations = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<CopyStatus>("idle");

  const handleCopy = useCallback(
    async (prompt: Prompt, event?: React.MouseEvent) => {
      event?.stopPropagation();

      try {
        setIsLoading(true);
        setStatus("idle");

        // 1. Call server action to deduct credits
        const result = await copyPromptAction(prompt.id);

        if (!result.success) {
          const errorMessage =
            typeof result.error === "string"
              ? result.error
              : (result.error?.message ?? "An error occurred");

          // Handle authentication error specifically
          if (
            errorMessage.includes("Authentication required") ||
            errorMessage.includes("Login")
          ) {
            onShowAuthModal?.();
            return;
          }

          throw new Error(errorMessage);
        }

        // 2. Copy to clipboard
        await navigator.clipboard.writeText(prompt.text);

        // 3. Update credits if returned
        if (result.data?.remainingCredits !== undefined) {
          onCreditsUpdate?.(result.data.remainingCredits);
        }

        // 4. Track analytics
        if (typeof window !== "undefined") {
          const { trackCopyClicked } = await import("~/lib/analytics-helpers");
          trackCopyClicked(prompt.id, true);
        }

        setStatus("copied");

        // Optional: Show toast if not handled by UI component
        // But usually UI handles it. We'll leave it to UI for now or add a generic one?
        // CopyButton uses ActionToast, Modal uses Sonner.
        // Let's just return success.
      } catch (error) {
        console.error("Failed to copy prompt:", error);
        setStatus("error");
        toast.error(
          error instanceof Error
            ? error.message
            : translations.promptCard.copyFailed,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onCreditsUpdate, onShowAuthModal, translations],
  );

  const clearStatus = useCallback(() => {
    setStatus("idle");
  }, []);

  return {
    isLoading,
    status,
    clearStatus,
    copyPrompt: handleCopy,
  };
}
