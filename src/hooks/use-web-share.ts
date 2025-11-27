import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "~/components/language-provider";

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

interface UseWebShareReturn {
  share: (data: ShareData) => Promise<void>;
  isSharing: boolean;
  isSupported: boolean;
}

/**
 * Custom hook for Web Share API with fallback to clipboard
 * Uses native share menu on mobile/supported browsers
 * Falls back to copy to clipboard on unsupported browsers
 */
export function useWebShare(): UseWebShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const translations = useTranslations();

  // Check if Web Share API is supported
  const isSupported = typeof window !== "undefined" && "share" in navigator;

  const share = useCallback(
    async (data: ShareData) => {
      // Prevent concurrent share calls
      if (isSharing) {
        return;
      }

      setIsSharing(true);

      try {
        if (isSupported) {
          // Use native Web Share API
          await navigator.share({
            title: data.title,
            text: data.text,
            url: data.url,
          });
          toast.success(translations.common.toast.shareSuccess);
        } else {
          // Fallback: Copy to clipboard
          const shareText = `${data.title}\n\n${data.text}${data.url ? `\n\n${data.url}` : ""}`;
          await navigator.clipboard.writeText(shareText);
          toast.success(translations.common.toast.copySuccess);
        }
      } catch (error: unknown) {
        // Handle Web Share API errors
        if (error instanceof DOMException) {
          // AbortError: User cancelled the share dialog
          if (error.name === "AbortError") {
            // Silent fail - this is expected behavior
            return;
          }
          // InvalidStateError: An earlier share hasn't completed yet
          if (error.name === "InvalidStateError") {
            // Silent fail - prevented by guard above, but handle just in case
            return;
          }
          // Other DOMExceptions from Web Share API
          console.error("Share error:", error);
          toast.error(translations.common.toast.shareFailed);
        } else if (error instanceof Error) {
          // Other errors
          console.error("Share error:", error);
          toast.error(translations.common.toast.shareFailed);
        }
      } finally {
        setIsSharing(false);
      }
    },
    [isSupported, isSharing, translations],
  );

  return {
    share,
    isSharing,
    isSupported,
  };
}
