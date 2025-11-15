import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useLocalePath } from "~/components/language-provider";
import type { UseGoogleAuthOptions, UseGoogleAuthReturn } from "~/lib/types";
import { toError } from "~/lib/errors";
import { env } from "~/env.js";
import { authClient } from "~/lib/auth-client";

/**
 * Custom hook for Google authentication with custom popup modal
 * Provides manual control over popup window and OAuth flow
 *
 * @param options - Authentication options and callbacks
 * @returns Google authentication state and actions including popup modal state
 */
export function useGoogleAuth(
  options: UseGoogleAuthOptions = {},
): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toLocalePath = useLocalePath();

  // Listen for authentication success via message events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      const allowedOrigins = [
        env.NEXT_PUBLIC_BETTER_AUTH_URL,
        "http://localhost:3000",
        window.location.origin,
      ];

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      // Handle successful authentication
      if (event.data?.type === "google-auth-success") {
        setIsModalOpen(false);
        setIsLoading(false);
        setAuthUrl(null);
        options.onSuccess?.();
        toast.success("Login berhasil!");

        // Refresh page to update session
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      // Handle authentication error
      if (event.data?.type === "google-auth-error") {
        setIsModalOpen(false);
        setIsLoading(false);
        setAuthUrl(null);
        const errorMsg = event.data.error || "Autentikasi gagal";
        setError(errorMsg);
        toast.error(errorMsg);
        options.onError?.(new Error(errorMsg));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [options]);

  /**
   * Initiate Google OAuth using authClient
   */
  const signInWithGoogle = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous auth attempts

    setIsLoading(true);
    setError(null);

    try {
      const callbackURL = options.redirectPath ?? toLocalePath("/");

      // Use authClient to generate OAuth URL
      // This will internally call better-auth's API to get the correct OAuth URL
      const response = await authClient.$fetch("/sign-in/social", {
        method: "POST",
        body: {
          provider: "google",
          callbackURL,
        },
      });

      // Handle response based on better-auth return type
      const data = response as { url?: string; error?: unknown };

      if (!data.url) {
        throw new Error("No OAuth URL returned");
      }

      setAuthUrl(data.url);
      setIsModalOpen(true);
    } catch (error: unknown) {
      const err = toError(error);
      const errorMessage = "Gagal memulai autentikasi. Silakan coba lagi.";

      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
      options.onError?.(err);
    }
  }, [options, toLocalePath, isLoading]);

  /**
   * Close modal and cleanup
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setAuthUrl(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    signInWithGoogle,
    authUrl,
    isModalOpen,
    closeModal,
    error,
  };
}
