import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useLocalePath } from "~/components/language-provider";
import type { UseGoogleAuthOptions, UseGoogleAuthReturn } from "~/lib/types";
import { toError } from "~/lib/errors";
import { authClient } from "~/lib/auth-client";

/**
 * Custom hook for Google authentication with redirect flow
 * Uses direct redirect to Google OAuth (most reliable method)
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

  /**
   * Initiate Google OAuth flow with redirect
   */
  const signInWithGoogle = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const callbackURL = options.redirectPath ?? toLocalePath("/");

      console.log("[useGoogleAuth] Starting Google OAuth flow...");
      console.log("[useGoogleAuth] Callback URL:", callbackURL);

      // Use authClient.signIn.social which will redirect the page
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL,
        },
        {
          onRequest: () => {
            console.log("[useGoogleAuth] Sending OAuth request...");
          },
          onSuccess: () => {
            console.log("[useGoogleAuth] OAuth redirect initiated");
          },
          onError: (ctx) => {
            console.error("[useGoogleAuth] OAuth error:", ctx.error);
            throw ctx.error;
          },
        },
      );

      // Note: code below won't execute as page redirects
    } catch (error: unknown) {
      const err = toError(error);
      console.error("[useGoogleAuth] Error:", err);

      // More specific error messages
      let errorMessage = "Gagal memulai autentikasi. Silakan coba lagi.";

      if (
        err.message?.includes("fetch failed") ||
        err.message?.includes("network")
      ) {
        errorMessage = "Koneksi gagal. Periksa internet Anda dan coba lagi.";
      } else if (err.message?.includes("timeout")) {
        errorMessage = "Request timeout. Silakan coba lagi.";
      }

      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
      options.onError?.(err);
    }
  }, [options, toLocalePath, isLoading]);

  const closeModal = useCallback(() => {
    setError(null);
    setIsLoading(false);
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
