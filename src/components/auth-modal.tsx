import { useTranslations } from "~/components/language-provider";
import { useGooglePopupAuth } from "~/hooks/use-google-popup-auth";
import { useCallback } from "react";
import { Button } from "~/components/ui/button";
import { GoogleIcon } from "~/components/icons/google-icon";
import type { BaseComponentProps } from "~/lib/types";

interface AuthModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Authentication modal with Google OAuth integration
 * Desktop: Opens popup window
 * Mobile: Redirects to new tab
 */
export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const translations = useTranslations();

  // Google auth hook - opens popup window
  const { signInWithGoogle, isLoading } = useGooglePopupAuth({
    onSuccess: useCallback(() => {
      onClose();
    }, [onClose]),
    onError: useCallback(() => {
      // Error handling is done in the hook via toast
    }, []),
  });

  // Handle Google sign in with loading protection
  const handleGoogleSignIn = useCallback((): void => {
    if (!isLoading) {
      void signInWithGoogle();
    }
  }, [signInWithGoogle, isLoading]);

  // Handle modal close
  const handleClose = useCallback((): void => {
    if (!isLoading) {
      onClose();
    }
  }, [onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {translations.auth.modal.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {translations.auth.modal.description}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="default"
            className="flex w-full items-center justify-center gap-3 text-base font-medium transition-all hover:shadow-lg"
            size="lg"
            disabled={isLoading}
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Lanjutkan dengan Google</span>
          </Button>

          {/* Terms and privacy */}
          <p className="text-center text-xs text-gray-500">
            Dengan melanjutkan, kamu menyetujui{" "}
            <a
              className="underline hover:text-gray-700"
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ketentuan
            </a>{" "}
            dan{" "}
            <a
              className="underline hover:text-gray-700"
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kebijakan Privasi
            </a>{" "}
            kami.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
