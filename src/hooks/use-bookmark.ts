import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { toggleSavePrompt, isPromptSaved } from "~/actions/saved-prompts";
import { useTranslations } from "~/components/language-provider";

interface UseBookmarkOptions {
  promptId: string;
  onSaveChange?: (saved: boolean) => void;
}

interface UseBookmarkReturn {
  isSaved: boolean;
  isLoading: boolean;
  toggleBookmark: () => Promise<void>;
}

/**
 * Custom hook for bookmark/save prompt functionality
 * Supports both authenticated users and guest sessions
 * Server actions automatically detect user type
 */
export function useBookmark({
  promptId,
  onSaveChange,
}: UseBookmarkOptions): UseBookmarkReturn {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const translations = useTranslations();

  // Check initial saved state
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        setIsChecking(true);
        // Server action will auto-detect user or guest
        const result = await isPromptSaved(promptId);

        if (result.success && result.data) {
          setIsSaved(result.data.saved);
        }
      } catch (error) {
        console.error("Failed to check saved status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    void checkSavedStatus();
  }, [promptId]);

  const toggleBookmark = useCallback(async () => {
    setIsLoading(true);

    try {
      // Server action will auto-detect user or guest
      const result = await toggleSavePrompt(promptId);

      if (result.success && result.data) {
        const newSavedState = result.data.saved;
        setIsSaved(newSavedState);
        onSaveChange?.(newSavedState);

        // Show success message
        if (newSavedState) {
          toast.success(translations.common.toast.saveSuccess);
        } else {
          toast.success(translations.common.toast.removeSuccess);
        }
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : translations.common.toast.saveFailed,
        );
      }
    } catch (error) {
      console.error("Toggle bookmark error:", error);
      toast.error(translations.common.toast.saveFailed);
    } finally {
      setIsLoading(false);
    }
  }, [promptId, onSaveChange, translations]);

  return {
    isSaved,
    isLoading: isLoading || isChecking,
    toggleBookmark,
  };
}
