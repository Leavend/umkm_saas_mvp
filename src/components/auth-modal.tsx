// src/components/auth-modal.tsx (enhanced)
import { useTranslations } from "~/components/language-provider";
import { useGoogleAuth } from "~/hooks/use-google-auth";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "~/components/icons/google-icon";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const translations = useTranslations();
  const { signInWithGoogle, isLoading, gsiDivRef } = useGoogleAuth({
    onSuccess: onClose,
    enableGsi: true,
  });

  // Prevent closing while loading to avoid accidental interruptions
  useEffect(() => {
    const body = document.body;
    if (isLoading) body.setAttribute("aria-busy", "true");
    else body.removeAttribute("aria-busy");
    return () => body.removeAttribute("aria-busy");
  }, [isLoading]);

  const handleGoogleSignIn = () => {
    signInWithGoogle().catch((error: unknown) => {
      console.error("Sign in failed:", error);
      // Toast sudah ditampilkan dari hook, jadi kita tidak perlu menampilkan lagi
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
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

        <DialogDescription className="pt-1 text-sm text-gray-600">
          {translations.auth.modal.description}
        </DialogDescription>

        <div className="pt-1">
          {isLoading && (
            <div className="mt-3 flex items-center justify-center space-x-2 rounded-md bg-blue-50 p-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">
                Membuka jendela autentikasi Google...
              </span>
            </div>
          )}
        </div>

        {/* Official GIS button will render here */}
        <div className="pt-4">
          <div
            ref={gsiDivRef}
            className="flex w-full justify-center"
            aria-label="Sign in with Google"
          />
        </div>

        {/* Fallback: your existing OAuth popup flow */}
        <div className="pt-3">
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
          <p className="mt-3 text-center text-xs text-gray-500">
            Dengan melanjutkan, kamu menyetujui{" "}
            <a
              className="underline"
              href="/terms"
              target="_blank"
              rel="noreferrer"
            >
              Ketentuan
            </a>{" "}
            dan{" "}
            <a
              className="underline"
              href="/privacy"
              target="_blank"
              rel="noreferrer"
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
