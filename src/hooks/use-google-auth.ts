// src/hooks/use-google-auth.ts (enhanced)
"use client";

import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { initiateGoogleSignIn, exchangeGoogleIdToken } from "~/lib/google-auth";
import { useGoogleOneTap } from "~/hooks/use-google-one-tap";

interface UseGoogleAuthOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
  /** If true, enable One Tap + official button in parallel */
  enableGsi?: boolean;
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const gsiDivRef = useRef<HTMLDivElement | null>(null);

  // GIS (One Tap + official button) — optional
  useGoogleOneTap({
    renderTarget: options.enableGsi ? gsiDivRef.current : null,
    autoPrompt: options.enableGsi !== false,
    onCredential: (credential) => {
      void (async () => {
        try {
          setIsLoading(true);
          const fallbackRedirectPath =
            options.redirectPath ??
            (typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : "/");
          await exchangeGoogleIdToken(credential, fallbackRedirectPath);

          // Show success message
          toast.success("Login berhasil! Sedang memuat...");

          // Call onSuccess callback
          options.onSuccess?.();

          // Refresh the page to update authentication state
          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Google One Tap failed";
          toast.error(errorMessage);
          options.onError?.(
            error instanceof Error ? error : new Error("Unknown error"),
          );
        } finally {
          setIsLoading(false);
        }
      })();
    },
    onError: (err) => {
      // Soft-error: GIS might be blocked, continue to show popup fallback
      console.warn("GIS error", err);
    },
  });

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const fallbackRedirectPath =
        options.redirectPath ??
        (typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/");

      await initiateGoogleSignIn({ redirectTo: fallbackRedirectPath });

      // Show success message
      toast.success("Login berhasil! Sedang memuat...");

      // Call onSuccess callback
      options.onSuccess?.();

      // Refresh the page to update authentication state
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(errorMessage);
      options.onError?.(
        error instanceof Error ? error : new Error("Unknown error"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    isLoading,
    signInWithGoogle,
    gsiDivRef,
  };
}
