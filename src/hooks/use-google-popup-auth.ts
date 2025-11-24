"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTranslations } from "~/components/language-provider";
import type { UseGoogleAuthOptions, UseGoogleAuthReturn } from "~/lib/types";
import { toError } from "~/lib/errors";

import { openAuthPopup } from "~/lib/auth-popup";

/**
 * Custom hook for Google OAuth with custom popup window
 * Desktop: Opens 600x700 centered popup
 * Mobile: Opens new tab
 */
export function useGooglePopupAuth(
  options: UseGoogleAuthOptions = {},
): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const isAuthCompletedRef = useRef(false);
  const translations = useTranslations();
  const t = translations.auth.toast;

  /**
   * Listen for auth success messages from popup
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent<{ type: string }>) => {
      // Security: verify origin
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        isAuthCompletedRef.current = true;
        setIsLoading(false);
        setError(null);
        toast.success(t.loginSuccess);
        options.onSuccess?.();
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        isAuthCompletedRef.current = true;
        const errorMessage = t.authFailed;
        setError(errorMessage);
        setIsLoading(false);
        toast.error(errorMessage);
        options.onError?.(new Error(errorMessage));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [options, t]);

  /**
   * Open custom popup window (desktop) or tab (mobile)
   */
  const openPopup = useCallback(
    (url: string) => {
      return openAuthPopup(url, isMobile);
    },
    [isMobile],
  );

  /**
   * Initiate Google sign-in with custom popup
   */
  const signInWithGoogle = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    isAuthCompletedRef.current = false;

    try {
      // Build auth trigger URL (which will initiate NextAuth OAuth flow)
      const callbackUrl = `${window.location.origin}/en/auth-success`;
      const authUrl = `/en/auth-trigger?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      // Open custom popup
      const popup = openPopup(authUrl);

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        throw new Error("popup_blocked");
      }

      // Monitor popup closure
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          setTimeout(() => {
            // Only trigger error if auth was not completed
            if (!isAuthCompletedRef.current) {
              setIsLoading(false);
              const errorMsg = t.authCancelled;
              setError(errorMsg);
              toast.error(errorMsg);
              options.onError?.(new Error(errorMsg));
              options.onPopupClosed?.(); // Notify parent to close modal
            }
          }, 500);
        }
      }, 500);

      // Cleanup after 5 minutes
      setTimeout(() => clearInterval(checkPopupClosed), 5 * 60 * 1000);
    } catch (error: unknown) {
      const err = toError(error);
      console.error("[useGooglePopupAuth] Error:", err);

      // Handle specific error cases
      if (err.message === "popup_blocked") {
        const errorMessage = t.popupBlocked;
        setError(errorMessage);
        toast.error(errorMessage, {
          description: t.popupBlockedDescription,
          duration: 5000,
        });
      } else {
        const errorMessage = t.authStartFailed;
        setError(errorMessage);
        toast.error(errorMessage);
      }

      setIsLoading(false);
      options.onError?.(err);
    }
  }, [options, isLoading, openPopup, t]);

  const closeModal = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    signInWithGoogle,
    isLoading,
    error,
    closeModal,
    authUrl: null, // Not used in popup flow
    isModalOpen: false, // Not used in popup flow
  };
}
