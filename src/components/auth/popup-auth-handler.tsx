// src/components/auth/popup-auth-handler.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface PopupAuthHandlerProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PopupAuthHandler({
  onSuccess,
  onError,
}: PopupAuthHandlerProps) {
  useEffect(() => {
    const handleMessage = (
      event: MessageEvent<{ type: string; error?: string }>,
    ) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        toast.success("Login berhasil! 🎉");
        onSuccess?.();
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        const errorMessage = event.data.error ?? "Autentikasi gagal";
        toast.error(errorMessage);
        onError?.(errorMessage);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onSuccess, onError]);

  return null; // This component doesn't render anything
}
