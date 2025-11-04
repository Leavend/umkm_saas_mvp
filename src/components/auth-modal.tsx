// src/components/auth-modal.tsx

"use client";

import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { authClient } from "~/lib/auth-client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

export function AuthModal({ isOpen, onClose, lang }: AuthModalProps) {
  const translations = useTranslations();

  const handleGoogleAuth = async () => {
    try {
      const origin = window.location.origin;
      const callbackURL = `${origin}/${lang}/dashboard`;

      // Close modal first to prevent any interference
      onClose();

      // Use popup flow - configured globally in auth-client.ts
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      console.error("Google authentication failed", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden.Root>
          <DialogTitle>Sign in to your account</DialogTitle>
        </VisuallyHidden.Root>
        <div className="flex justify-center">
          <Button
            onClick={handleGoogleAuth}
            className="flex w-full max-w-xs items-center justify-center gap-2 py-2"
          >
            {/* SVG Google Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {translations.auth.socialProviders.google.continue}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
