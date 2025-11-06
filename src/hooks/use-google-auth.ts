// src/hooks/use-google-auth.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

// Hapus import getErrorMessage - INI PENTING
// import { getErrorMessage } from "~/lib/errors"; 

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
      // 1. Gunakan nama variabel yang benar (redirectPath)
      const fallbackRedirectPath =
        options.redirectPath ??
        (typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/");

      // 2. Kirim 'redirectTo' (bukan callbackPath)
      await initiateGoogleSignIn({
        redirectTo: fallbackRedirectPath,
      });

      options.onSuccess?.();
    } catch (error: unknown) {
      // 3. Blok catch yang AMAN (tidak pakai getErrorMessage)
      let errorMessage: string;

      if (error instanceof Error) {
        // Ini akan menangkap Error bersih dari initiateGoogleSignIn
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        // Fallback jika terjadi sesuatu yang sangat aneh
        errorMessage = "An unexpected authentication error occurred.";
      }
      // =========================================================

      // Tampilkan toast
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

      // Panggil onError callback
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