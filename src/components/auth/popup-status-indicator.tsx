// src/components/auth/popup-status-indicator.tsx
"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface PopupStatusIndicatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PopupStatusIndicator({
  isOpen,
  onClose,
}: PopupStatusIndicatorProps) {
  const [status, setStatus] = useState<
    "opening" | "waiting" | "success" | "error" | null
  >(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setStatus(null);
      return;
    }

    setStatus("opening");
    setMessage("Membuka jendela autentikasi...");

    const timer = setTimeout(() => {
      setStatus("waiting");
      setMessage("Silakan selesaikan autentikasi di tab yang baru dibuka");
    }, 1000);

    const handleMessage = (
      event: MessageEvent<{ type: string; error?: string }>,
    ) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        setStatus("success");
        setMessage("Login berhasil! Mengalihkan...");
        setTimeout(() => {
          onClose();
          // Redirect or refresh based on your needs
          window.location.reload();
        }, 1500);
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        setStatus("error");
        setMessage(event.data.error ?? "Autentikasi gagal");
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen, onClose]);

  if (!status) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          {status === "opening" || status === "waiting" ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          ) : status === "success" ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
              <Check className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
              <X className="h-4 w-4 text-white" />
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-medium text-gray-900">
              {status === "opening" && "Membuka Autentikasi"}
              {status === "waiting" && "Menunggu Autentikasi"}
              {status === "success" && "Berhasil!"}
              {status === "error" && "Terjadi Kesalahan"}
            </h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>

        {status === "waiting" && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Batalkan
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
