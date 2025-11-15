"use client";

import { useEffect } from "react";
import { Loader2, Check } from "lucide-react";

/**
 * Auth Success Page
 * This page is opened in a popup window after successful Google OAuth
 * It sends a message to the parent window and then closes itself
 */
export default function AuthSuccessPage() {
  useEffect(() => {
    // Send success message to parent window (opener)
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "google-auth-success",
          timestamp: Date.now(),
        },
        window.location.origin
      );

      // Close popup after a short delay to show success message
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      // If no opener, redirect to home
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
            <div className="absolute -bottom-1 -right-1">
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
            <p className="text-xs text-green-700">
              Jendela ini akan ditutup secara otomatis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
