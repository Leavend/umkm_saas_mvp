"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";

/**
 * Auth Error Page
 * Displayed when OAuth authentication fails
 */
export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    // Send error message to parent window if this is a popup
    const targetWindow = (window.opener ?? window.parent) as Window | null;

    if (targetWindow && targetWindow !== window) {
      try {
        targetWindow.postMessage(
          {
            type: "GOOGLE_AUTH_ERROR",
            error: error ?? "unknown_error",
            timestamp: Date.now(),
          },
          window.location.origin,
        );

        // Auto-close popup after delay
        if (window.opener) {
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } catch (err) {
        console.error("Failed to send error message:", err);
      }
    }
  }, [error]);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "Ada masalah dengan konfigurasi autentikasi. Silakan hubungi administrator.";
      case "AccessDenied":
        return "Akses ditolak. Anda membatalkan proses login.";
      case "Verification":
        return "Link verifikasi tidak valid atau sudah kadaluarsa.";
      default:
        return "Terjadi kesalahan saat login. Silakan coba lagi.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Error Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-200">
              <X className="h-10 w-10 stroke-[3] text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Login Gagal</h1>
            <p className="mt-2 text-sm text-gray-600">
              {getErrorMessage(error)}
            </p>
          </div>

          {/* Error Details */}
          {error && (
            <div className="w-full rounded-lg bg-red-50 p-4">
              <p className="font-mono text-xs text-red-700">Error: {error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex w-full flex-col gap-3">
            <Link
              href="/en"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Kembali ke Beranda
            </Link>

            {window.opener && (
              <button
                onClick={() => window.close()}
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Tutup Window
              </button>
            )}
          </div>

          {/* Auto-close Notice */}
          {window.opener && (
            <p className="text-xs text-gray-500">
              Window akan otomatis tertutup dalam 3 detik...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
