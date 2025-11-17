"use client";

import { useEffect, useCallback, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import type { BaseComponentProps } from "~/lib/types";

interface GoogleAuthPopupProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  authUrl: string | null;
  isLoading: boolean;
  error?: string | null;
}

/**
 * Google Auth Modal with Iframe
 * Displays Google OAuth directly in modal iframe
 */
export function GoogleAuthPopup({
  isOpen,
  onClose,
  authUrl,
  error,
}: GoogleAuthPopupProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Debug log
  useEffect(() => {
    console.log(
      "[GoogleAuthPopup] isOpen:",
      isOpen,
      "authUrl:",
      authUrl,
      "error:",
      error,
    );
  }, [isOpen, authUrl, error]);

  // Reset iframe state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIframeLoaded(false);
    }
  }, [isOpen]);

  // Handle modal close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-lg">
        {/* Loading State */}
        {!iframeLoaded && authUrl && !error && (
          <div className="flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Memuat Google Sign In...
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Mohon tunggu sebentar
              </p>
            </div>
          </div>
        )}

        {/* Google OAuth Iframe */}
        {authUrl && !error && (
          <div className="relative bg-white">
            <iframe
              src={authUrl}
              className="h-[600px] w-full"
              title="Google Authentication"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-storage-access-by-user-activation allow-top-navigation"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center space-y-4 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">
                Terjadi Kesalahan
              </p>
              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              Tutup
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
