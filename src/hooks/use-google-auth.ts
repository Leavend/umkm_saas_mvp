// src/hooks/use-google-auth.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { logError } from "~/lib/errors";
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
      const err =
        error instanceof Error
          ? error
          : new Error("Google authentication failed");

      logError("Google authentication failed", err);
      toast.error(err.message || translations.auth.modal.authFailed);
      options.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [lang, options, translations]);

  return {
    signInWithGoogle,
    isLoading,
  };
}
