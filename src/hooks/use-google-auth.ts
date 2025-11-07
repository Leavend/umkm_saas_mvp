import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useLocalePath } from "~/components/language-provider";
import { authClient } from "~/lib/auth-client";
import type { UseGoogleAuthOptions, UseGoogleAuthReturn } from "~/lib/types";
import { toError } from "~/lib/errors";

/**
 * Custom hook for Google authentication with popup flow
 * Integrates with better-auth for session management
 */
export function useGoogleAuth(
  options: UseGoogleAuthOptions = {},
): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const toLocalePath = useLocalePath();

  const signInWithGoogle = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous auth attempts

    setIsLoading(true);
    try {
      // Use better-auth's signIn function for Google OAuth
      await authClient.signIn.social({
        provider: "google",
        callbackURL: options.redirectPath ?? toLocalePath("/"),
        // Use popup flow as configured in auth-client
      });

      // Success callback
      options.onSuccess?.();
      toast.success("Login berhasil!");
    } catch (error: unknown) {
      const err = toError(error);

      console.error("Google auth error:", err);

      // Handle specific error cases
      const errorMessage = err.message.toLowerCase();

      if (errorMessage.includes("popup") && errorMessage.includes("diblokir")) {
        toast.error("Popup diblokir. Izinkan popup untuk situs ini.");
      } else if (errorMessage.includes("ditutup oleh pengguna")) {
        console.warn("Popup ditutup oleh pengguna.");
        // Jangan tampilkan error untuk user yang menutup popup
      } else if (errorMessage.includes("timeout")) {
        toast.error("Autentikasi timeout. Silakan coba lagi.");
      } else if (errorMessage.includes("network")) {
        toast.error("Koneksi internet bermasalah. Silakan coba lagi.");
      } else {
        toast.error("Autentikasi Google gagal. Silakan coba lagi.");
      }

      // Call error callback
      options.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [options, toLocalePath, isLoading]);

  return {
    isLoading,
    signInWithGoogle,
  };
}
