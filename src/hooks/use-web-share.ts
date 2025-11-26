import { useCallback, useState } from "react";
import { toast } from "sonner";

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

    // Check if Web Share API is supported
    const isSupported =
        typeof window !== "undefined" && "share" in navigator;

    const share = useCallback(
        async (data: ShareData) => {
            setIsSharing(true);

            try {
                if (isSupported) {
                    // Use native Web Share API
                    await navigator.share({
                        title: data.title,
                        text: data.text,
                        url: data.url,
                    });
                    toast.success("Berhasil dibagikan!");
                } else {
                    // Fallback: Copy to clipboard
                    const shareText = `${data.title}\n\n${data.text}${data.url ? `\n\n${data.url}` : ""}`;
                    await navigator.clipboard.writeText(shareText);
                    toast.success("Teks disalin ke clipboard!");
                }
            } catch (error: unknown) {
                // User cancelled share or other error
                if (
                    error instanceof Error &&
                    error.name !== "AbortError"
                ) {
                    console.error("Share error:", error);
                    toast.error("Gagal membagikan");
                }
            } finally {
                setIsSharing(false);
            }
        },
        [isSupported],
    );

    return {
        share,
        isSharing,
        isSupported,
    };
}
