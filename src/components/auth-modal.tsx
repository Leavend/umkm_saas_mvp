// src/components/auth-modal.tsx (dengan custom hook)
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { useGoogleAuth } from "~/hooks/use-google-auth";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "~/components/icons/google-icon";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const translations = useTranslations();
  const { signInWithGoogle, isLoading } = useGoogleAuth({
    onSuccess: onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-lg p-6 shadow-xl sm:max-w-md [&>button.absolute]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {translations.auth.modal.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-mt-2 -mr-2 h-auto rounded-md px-2 py-1"
              disabled={isLoading}
            >
              {translations.auth.modal.closeButton}
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="pt-1">
          <p className="text-sm text-gray-600">
            {translations.auth.modal.description}
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={signInWithGoogle}
            variant="default"
            className="flex w-full items-center justify-center gap-3 text-base font-medium"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                {translations.auth.modal.googleButton}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
