"use client";

import { useEffect, useCallback, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "~/components/ui/dialog";
import { ModalHeader } from "~/components/ui/modal-header";
import { GoogleIcon } from "~/components/icons/google-icon";
import type { BaseComponentProps } from "~/lib/types";

interface GoogleAuthPopupProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  authUrl: string | null;
  isLoading: boolean;
  error?: string | null;
}

/**
 * Custom Google Auth Popup Modal
 * Displays a modal with Google OAuth flow in a popup window
 * Provides better UX than default browser popup
 */
export function GoogleAuthPopup({
  isOpen,
  onClose,
  authUrl,
  isLoading,
  error,
}: GoogleAuthPopupProps) {
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Open popup window when authUrl is available
  useEffect(() => {
    if (!authUrl || !isOpen) return;

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0`
    );

    if (!popup || popup.closed) {
      setPopupBlocked(true);
      return;
    }

    setPopupWindow(popup);
    setPopupBlocked(false);

    // Focus on popup
    popup.focus();

    return () => {
      if (popup && !popup.closed) {
        popup.close();
      }
    };
  }, [authUrl, isOpen]);

  // Monitor popup window status
  useEffect(() => {
    if (!popupWindow) return;

    const checkPopupClosed = setInterval(() => {
      if (popupWindow.closed) {
        clearInterval(checkPopupClosed);
        setPopupWindow(null);
        // Auto close modal after a delay if popup was closed
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }, 500);

    return () => clearInterval(checkPopupClosed);
  }, [popupWindow, onClose]);

  // Handle manual retry if popup was blocked
  const handleRetry = useCallback(() => {
    setPopupBlocked(false);
    if (authUrl) {
      window.location.href = authUrl; // Fallback to redirect
    }
  }, [authUrl]);

  // Prevent modal close during loading
  const handleClose = useCallback(() => {
    if (!isLoading && popupWindow) {
      popupWindow.close();
    }
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, popupWindow, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-lg p-6 shadow-xl sm:max-w-md">
        <ModalHeader
          title="Autentikasi Google"
          description="Lanjutkan dengan Google untuk mengakses semua fitur"
          onClose={handleClose}
          closeDisabled={isLoading}
        />

        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && !popupBlocked && (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg bg-blue-50 p-6">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700">
                  Membuka jendela autentikasi Google...
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  Mohon tunggu sebentar
                </p>
              </div>
            </div>
          )}

          {/* Popup Window Opened State */}
          {popupWindow && !popupWindow.closed && !popupBlocked && (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg bg-green-50 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                <span className="text-lg text-green-700">✓</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-green-700">
                  Jendela Google terbuka
                </p>
                <p className="mt-1 text-xs text-green-600">
                  Silakan login di jendela popup
                </p>
              </div>
              <button
                onClick={() => popupWindow.focus()}
                className="mt-2 text-xs text-green-700 underline hover:text-green-800"
              >
                Klik di sini jika jendela tersembunyi
              </button>
            </div>
          )}

          {/* Popup Blocked State */}
          {popupBlocked && (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg bg-orange-50 p-6">
              <X className="h-8 w-8 text-orange-600" />
              <div className="text-center">
                <p className="text-sm font-medium text-orange-700">
                  Popup diblokir oleh browser
                </p>
                <p className="mt-1 text-xs text-orange-600">
                  Izinkan popup untuk situs ini atau klik tombol di bawah
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="mt-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Lanjutkan dengan Redirect
              </button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg bg-red-50 p-6">
              <X className="h-8 w-8 text-red-600" />
              <div className="text-center">
                <p className="text-sm font-medium text-red-700">
                  Terjadi Kesalahan
                </p>
                <p className="mt-1 text-xs text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <GoogleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">
                  Kenapa menggunakan Google?
                </p>
                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                  <li>• Login cepat tanpa password</li>
                  <li>• Keamanan terjamin oleh Google</li>
                  <li>• Data Anda tetap privat</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Terms and Privacy */}
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
