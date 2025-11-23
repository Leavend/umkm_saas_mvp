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
    onPopupClosed: useCallback(() => {
      // Close modal when popup is closed by user
      onClose();
    }, [onClose]),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-1xl font-bold text-gray-900">
              {translations.auth.modal.title}
            </h2>
            <p className="mt-2 text-base text-gray-600">
              {translations.auth.modal.description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-3 text-base font-medium text-gray-900 transition-colors hover:text-gray-600"
            disabled={isLoading}
          >
            {translations.common.actions.close}
          </button>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-[#d9a632] py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#c89228] hover:shadow-md"
          disabled={isLoading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.8055 10.2292C19.8055 9.55146 19.7501 8.86938 19.6308 8.20166H10.2002V12.0488H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0876V17.5866H16.8251C18.7192 15.8449 19.8055 13.2728 19.8055 10.2292Z"
              fill="#4285F4"
            />
            <path
              d="M10.2002 20.0006C12.9506 20.0006 15.2689 19.1151 16.8295 17.5865L13.6069 15.0875C12.7096 15.6979 11.552 16.0433 10.2046 16.0433C7.54523 16.0433 5.2916 14.283 4.50439 11.9165H1.1875V14.4921C2.77982 17.8094 6.31153 20.0006 10.2002 20.0006Z"
              fill="#34A853"
            />
            <path
              d="M4.50001 11.9167C4.04891 10.6744 4.04891 9.33027 4.50001 8.08789V5.51233H1.18749C-0.391538 8.67814 -0.391538 12.3265 1.18749 15.4923L4.50001 11.9167Z"
              fill="#FBBC04"
            />
            <path
              d="M10.2002 3.95802C11.6251 3.93601 13.0004 4.47274 14.036 5.45617L16.8906 2.60191C15.1816 0.990879 12.9331 0.100924 10.2002 0.125954C6.31153 0.125954 2.77982 2.31718 1.1875 5.63846L4.5 8.21401C5.28282 5.84314 7.54083 3.95802 10.2002 3.95802Z"
              fill="#EA4335"
            />
          </svg>
          <span>{translations.auth.modal.googleButton}</span>
        </Button>
      </div>
    </div>
  );
}
