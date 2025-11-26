import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { toggleSavePrompt, isPromptSaved } from "~/actions/saved-prompts";

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
          toast.success("Prompt berhasil disimpan!");
        } else {
          toast.success("Prompt dihapus dari favorit");
        }
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Gagal menyimpan prompt",
        );
      }
    } catch (error) {
      console.error("Toggle bookmark error:", error);
      toast.error("Gagal menyimpan prompt");
    } finally {
      setIsLoading(false);
    }
  }, [promptId, onSaveChange]);

  return {
    isSaved,
    isLoading: isLoading || isChecking,
    toggleBookmark,
  };
}
