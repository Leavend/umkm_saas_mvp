"use client";

import { useState, useCallback } from "react";
import type { Prompt } from "@prisma/client";

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
 * Prompt copy hook - returns status for component feedback
 */
export function usePromptCopy({
  onCreditsUpdate,
  onShowAuthModal,
}: UsePromptCopyOptions = {}): UsePromptCopyReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<CopyStatus>("idle");

  const handleCopy = useCallback(
    async (prompt: Prompt, event?: React.MouseEvent) => {
      event?.stopPropagation();

      try {
        setIsLoading(true);
        setStatus("idle");

        await navigator.clipboard.writeText(prompt.text);
        setStatus("copied");

        // Track copy event
        if (typeof window !== "undefined") {
          const { trackCopyClicked } = await import("~/lib/analytics-helpers");
          trackCopyClicked(prompt.id, true);
        }
      } catch (error) {
        console.error("Failed to copy prompt:", error);
        setStatus("error");
      } finally {
        setIsLoading(false);
      }
    },
    [],
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
