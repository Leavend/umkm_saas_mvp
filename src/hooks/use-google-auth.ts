// src/hooks/use-google-auth.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { getErrorMessage, logError } from "~/lib/errors";
import { initiateGoogleSignIn } from "~/lib/google-auth";
import { normalizeLocale, DEFAULT_LOCALE } from "~/lib/i18n";
import { useTranslations } from "~/components/language-provider";

interface UseGoogleAuthOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams<{ lang?: string }>();
  //   const router = useRouter();
  const lang = normalizeLocale(params?.lang, DEFAULT_LOCALE);
  const translations = useTranslations();

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const callbackPath = options.redirectPath ?? `/${lang}/dashboard`;
      await initiateGoogleSignIn({ callbackPath });
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

      // Log only the safe error message, not the original error object
      console.error(`Google authentication failed: ${errorMessage}`);

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
  }, [lang, options, translations]);

  return {
    signInWithGoogle,
    isLoading,
  };
}
