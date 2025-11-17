"use client";

import { useEffect } from "react";
import { Loader2, Check } from "lucide-react";

/**
 * Auth Success Page
 * This page is shown after successful Google OAuth
 * It sends a message to the parent window (either opener or parent frame)
 * and then redirects or closes accordingly
 */
export default function AuthSuccessPage() {
  useEffect(() => {
    // Try to communicate with parent window
    // Support both popup and iframe flows
    const targetWindow = (window.opener ?? window.parent) as Window | null;

    if (targetWindow && targetWindow !== window) {
      // Send success message to parent window
      targetWindow.postMessage(
        {
          type: "google-auth-success",
          timestamp: Date.now(),
        },
        window.location.origin,
      );

      // If this was a popup, close it
      if (window.opener) {
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        // If this was an iframe, just show success briefly
        // Parent will close the modal
        setTimeout(() => {
          // Fallback redirect if modal doesn't close
          window.location.href = "/";
        }, 3000);
      }
    } else {
      // If no parent, redirect to home
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <div className="absolute -right-1 -bottom-1">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Login Berhasil!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Anda akan segera diarahkan...
            </p>
          </div>

          <div className="w-full rounded-lg bg-green-50 p-4">
            <p className="text-xs text-green-700">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
