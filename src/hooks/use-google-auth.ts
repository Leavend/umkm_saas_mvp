// src/hooks/use-google-auth.ts

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useLocalePath } from "~/components/language-provider";
import { useIsMobile } from "~/hooks/use-mobile";
import type { UseGoogleAuthOptions, UseGoogleAuthReturn } from "~/lib/types";
import { toError } from "~/lib/errors";
import { authClient } from "~/lib/auth-client";
import { openAuthPopup, isPopupBlocked, focusPopup } from "~/lib/auth-popup";

/**
 * Custom hook for Google authentication with popup window flow
 * - Desktop: Opens centered popup window (600x700px)
 * - Mobile: Opens new tab (native behavior)
 * - Auto-closes popup/tab after successful auth
 * - Parent window automatically refreshes session
 *
 * Uses better-auth client with custom window opening
 *
 * @param options - Authentication options and callbacks
 * @returns Google authentication state and actions
 */
export function useGoogleAuth(
  options: UseGoogleAuthOptions = {},
): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toLocalePath = useLocalePath();
  const isMobile = useIsMobile();
  const popupRef = useRef<Window | null>(null);
  const originalWindowOpen = useRef<typeof window.open | null>(null);

  /**
   * Cleanup popup on unmount
   */
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
      // Restore original window.open if we modified it
      if (originalWindowOpen.current) {
        window.open = originalWindowOpen.current;
      }
    };
  }, []);

  /**
   * Initiate Google OAuth with popup window
   * Intercepts better-auth's redirect and opens in popup instead
   */
  const signInWithGoogle = useCallback(async () => {
    if (isLoading) return;

    // If popup already exists and not closed, focus it
    if (popupRef.current && !popupRef.current.closed) {
      focusPopup(popupRef.current);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const callbackURL = options.redirectPath ?? toLocalePath("/");

      // Intercept window.open to control popup creation
      originalWindowOpen.current = window.open;

      window.open = function (url?: string | URL, target?: string, features?: string) {
        // Restore original immediately
        if (originalWindowOpen.current) {
          window.open = originalWindowOpen.current;
        }

        if (url) {
          // Open with our custom popup function
          const popup = openAuthPopup(url.toString(), isMobile);

          if (isPopupBlocked(popup)) {
            throw new Error("popup_blocked");
          }

          popupRef.current = popup;

          // Monitor popup closure
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              setIsLoading(false);
              popupRef.current = null;
            }
          }, 500);

          // Cleanup after 5 minutes
          setTimeout(() => clearInterval(checkClosed), 5 * 60 * 1000);

          return popup;
        }

        return null;
      } as typeof window.open;

      // Use authClient.signIn.social - it will call window.open which we intercepted
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

    } catch (error: unknown) {
      const err = toError(error);

      // Restore original window.open on error
      if (originalWindowOpen.current) {
        window.open = originalWindowOpen.current;
      }

      console.error("[useGoogleAuth] Error:", err);

      // Handle popup blocker specifically
      if (err.message?.includes("popup_blocked")) {
        const errorMessage =
          "Popup diblokir. Mohon izinkan popup untuk login dengan Google.";
        setError(errorMessage);
        toast.error(errorMessage, {
          description: "Cek pengaturan browser Anda",
          duration: 5000,
        });
      } else if (
        err.message?.includes("fetch failed") ||
        err.message?.includes("network")
      ) {
        const errorMessage = "Koneksi gagal. Periksa internet Anda dan coba lagi.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (err.message?.includes("timeout")) {
        const errorMessage = "Request timeout. Silakan coba lagi.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = "Gagal memulai autentikasi. Silakan coba lagi.";
        setError(errorMessage);
        toast.error(errorMessage);
      }

      setIsLoading(false);
      options.onError?.(err);
    }
  }, [options, toLocalePath, isLoading, isMobile]);

  const closeModal = useCallback(() => {
    setError(null);
    setIsLoading(false);
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }
  }, []);

  return {
    isLoading,
    signInWithGoogle,
    authUrl: null,
    isModalOpen: false,
    closeModal,
    error,
  };
}
