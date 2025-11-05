// src/components/auth-modal.tsx

"use client";

import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { toast } from "sonner";
import { logError } from "~/lib/errors";
import { authClient } from "~/lib/auth-client";
import { DEFAULT_LOCALE, normalizeLocale } from "~/lib/i18n";

// --- Komponen Ikon Google (SVG) ---
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    fill="currentColor"
  >
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 1.9-4.63 1.9-3.82 0-6.9-3.1-6.9-6.9s3.08-6.9 6.9-6.9c2.1 0 3.5.86 4.37 1.62l2.35-2.3c-1.4-1.3-3.3-2.1-5.6-2.1-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5c2.6 0 4.3-.86 5.7-2.2 1.5-1.4 2-3.6 2-5.5 0-.8-.1-1.4-.2-2z" />
  </svg>
);
// --- Batas Komponen Ikon Google ---

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const params = useParams<{ lang?: string }>();
  const lang = normalizeLocale(params?.lang, DEFAULT_LOCALE);
  const translations = useTranslations();

  const handleGoogleAuth = () => {
    try {
      const origin = window.location.origin;
      const callbackURL = `${origin}/${lang}/dashboard`;

      authClient.signIn
        .social({
          provider: "google",
          callbackURL,
        })
        .catch((err: unknown) => {
          logError("Google authentication failed", err);
          toast.error(
            err instanceof Error
              ? err.message
              : (translations.auth.modal.authFailed as string),
          );
        });

      onClose();
    } catch (error: unknown) {
      logError("Google authentication setup failed", error);
      toast.error(
        error instanceof Error
          ? error.message
          : (translations.auth.modal.genericError as string),
      );
      onClose();
    }
  };

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
              className="-mt-2 -mr-2 h-auto rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={translations.auth.modal.closeButton}
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
            onClick={handleGoogleAuth}
            variant="default"
            className="flex w-full items-center justify-center gap-3 text-base font-medium"
            size="lg"
          >
            <GoogleIcon className="h-5 w-5" />
            {translations.auth.modal.googleButton}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
