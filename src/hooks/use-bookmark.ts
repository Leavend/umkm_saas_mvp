import { useState, useCallback, useEffect } from "react";
import { toggleSavePrompt, isPromptSaved } from "~/actions/saved-prompts";

interface UseBookmarkOptions {
  promptId: string;
  onSaveChange?: (saved: boolean) => void;
}

type BookmarkStatus = "idle" | "saved" | "removed" | "error";

interface UseBookmarkReturn {
  isSaved: boolean;
  isLoading: boolean;
  toggleBookmark: () => Promise<void>;
  status: BookmarkStatus;
  clearStatus: () => void;
}

/**
 * Bookmark hook - returns status for component to handle UI feedback
 */
export function useBookmark({
  promptId,
  onSaveChange,
}: UseBookmarkOptions): UseBookmarkReturn {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [status, setStatus] = useState<BookmarkStatus>("idle");

  // Check initial saved state
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        setIsChecking(true);
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
    setStatus("idle");

    try {
      const result = await toggleSavePrompt(promptId);

      if (result.success && result.data) {
        const newSavedState = result.data.saved;
        setIsSaved(newSavedState);
        setStatus(newSavedState ? "saved" : "removed");
        onSaveChange?.(newSavedState);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Toggle bookmark error:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [promptId, onSaveChange]);

  const clearStatus = useCallback(() => {
    setStatus("idle");
  }, []);

  return {
    isSaved,
    isLoading: isLoading || isChecking,
    toggleBookmark,
    status,
    clearStatus,
  };
}
