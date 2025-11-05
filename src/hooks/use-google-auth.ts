// src/hooks/use-google-auth.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "~/lib/errors";
import { authClient, isGoogleOneTapEnabled } from "~/lib/auth-client";
import { initiateGoogleSignIn } from "~/lib/google-auth";

import { useTranslations } from "~/components/language-provider";

interface UseGoogleAuthOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const translations = useTranslations();

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isGoogleOneTapEnabled) {
        await authClient.oneTap({
          fetchOptions: {
            onSuccess: () => {
              options.onSuccess?.();
            },
          },
          onPromptNotification: (notification: { type: string }) => {
            console.warn("One Tap prompt notification:", notification.type);
          },
        });
        return;
      }

      const fallbackCallbackPath =
        options.redirectPath ??
        (typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/");

      await initiateGoogleSignIn({
        callbackPath: fallbackCallbackPath,
      });

      options.onSuccess?.();
    } catch (error: unknown) {
      // Safely extract error message, handling circular references
      let errorMessage: string;
      try {
        errorMessage = getErrorMessage(error);
      } catch {
        // Fallback if getErrorMessage itself fails
        errorMessage = "Authentication failed due to an unexpected error";
      }

      // Avoid logging to prevent circular reference serialization issues

      // Provide user feedback
      if (
        errorMessage.includes("Popup blocked") ||
        errorMessage.includes("closed")
      ) {
        toast.error("Popup was blocked or closed before completion.");
      } else {
        toast.error(
          errorMessage === "NEXT_NOT_FOUND"
            ? translations.auth.modal.authFailed
            : `Error: ${errorMessage}`,
        );
      }

      // Call the onError callback with a clean error
      options.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [options, translations]);

  return {
    signInWithGoogle,
    isLoading,
  };
}
