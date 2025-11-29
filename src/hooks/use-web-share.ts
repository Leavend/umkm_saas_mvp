import { useCallback, useState } from "react";

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

type ShareStatus = "idle" | "shared" | "error";

interface UseWebShareReturn {
  share: (data: ShareData) => Promise<void>;
  isSharing: boolean;
  isSupported: boolean;
  status: ShareStatus;
  clearStatus: () => void;
}

/**
 * Web Share hook - returns status for component feedback
 */
export function useWebShare(): UseWebShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState<ShareStatus>("idle");

  const isSupported = typeof window !== "undefined" && "share" in navigator;

  const share = useCallback(
    async (data: ShareData) => {
      if (isSharing) return;

      setIsSharing(true);
      setStatus("idle");

      try {
        if (isSupported) {
          await navigator.share({
            title: data.title,
            text: data.text,
            url: data.url,
          });
          setStatus("shared");
        } else {
          const shareText = `${data.title}\n\n${data.text}${data.url ? `\n\n${data.url}` : ""}`;
          await navigator.clipboard.writeText(shareText);
          setStatus("shared");
        }
      } catch (error: unknown) {
        if (error instanceof DOMException) {
          if (
            error.name === "AbortError" ||
            error.name === "InvalidStateError"
          ) {
            return;
          }
          console.error("Share error:", error);
          setStatus("error");
        } else if (error instanceof Error) {
          console.error("Share error:", error);
          setStatus("error");
        }
      } finally {
        setIsSharing(false);
      }
    },
    [isSupported, isSharing],
  );

  const clearStatus = useCallback(() => {
    setStatus("idle");
  }, []);

  return {
    share,
    isSharing,
    isSupported,
    status,
    clearStatus,
  };
}
