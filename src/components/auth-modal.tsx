import { useTranslations } from "~/components/language-provider";
import { useGoogleAuth } from "~/hooks/use-google-auth";
import { Loader2, X } from "lucide-react";
import { GoogleIcon } from "~/components/icons/google-icon";
import { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { BaseComponentProps } from "~/lib/types";

interface AuthModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Authentication modal with Google OAuth integration
 * Provides a clean, accessible login experience
 */
export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const translations = useTranslations();

  // Google auth hook with proper error handling
  const { signInWithGoogle, isLoading } = useGoogleAuth({
    onSuccess: useCallback(() => {
      onClose();
    }, [onClose]),
    onError: useCallback((error: Error) => {
      console.error("Auth error in modal:", error);
      // Error handling is done in the hook via toast
    }, []),
  });

  // Accessibility: Prevent modal close during loading
  useEffect(() => {
    const body = document.body;
    if (isLoading) {
      body.setAttribute("aria-busy", "true");
    } else {
      body.removeAttribute("aria-busy");
    }
    return () => body.removeAttribute("aria-busy");
  }, [isLoading]);

  // Handle Google sign in with loading protection
  const handleGoogleSignIn = useCallback(() => {
    if (!isLoading) {
      void signInWithGoogle();
    }
  }, [signInWithGoogle, isLoading]);

  // Handle modal close with loading protection
  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [onClose, isLoading]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-lg p-6 shadow-xl sm:max-w-md">
        {/* Custom close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 rounded-full p-0"
          onClick={handleClose}
          disabled={isLoading}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {translations.auth.modal.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {translations.auth.modal.description}
          </DialogDescription>
        </DialogHeader>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-blue-50 p-4">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">
              Membuka jendela autentikasi Google...
            </span>
          </div>
        )}

        {/* Auth actions */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="default"
            className="flex w-full items-center justify-center gap-3 text-base font-medium transition-all hover:shadow-lg"
            size="lg"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Membuka tab baru...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                <span>Lanjutkan dengan Google</span>
              </>
            )}
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
      </DialogContent>
    </Dialog>
  );
}
