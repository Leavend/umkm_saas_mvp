"use client";

import { useEffect } from "react";
import { Loader2, Check } from "lucide-react";

/**
 * Auth Success Page
 * Displayed after successful Google OAuth authentication
 * 
 * Flow:
 * 1. User completes Google auth
 * 2. Redirected here from /api/auth/callback
 * 3. Sends success message to parent window (opener or parent)
 * 4. Auto-closes popup/tab after 800ms
 * 5. Parent window refreshes session
 */
export default function AuthSuccessPage() {
  useEffect(() => {
    // Get target window (popup opener or iframe parent)
    const targetWindow = (window.opener ?? window.parent) as Window | null;

    if (targetWindow && targetWindow !== window) {
      try {
        // Send success message to parent window
        targetWindow.postMessage(
          {
            type: "google-auth-success",
            timestamp: Date.now(),
          },
          window.location.origin,
        );

        // If this was a popup window, close it automatically
        if (window.opener) {
          setTimeout(() => {
            window.close();
          }, 800); // Fast close for better UX
        } else {
          // If this was an iframe, wait longer then fallback redirect
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      } catch (error) {
        // If postMessage fails (cross-origin), fallback to redirect
        console.error("Failed to send auth success message:", error);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } else {
      // No parent window found, redirect to home
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Success Icon with Loading */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <div className="absolute -right-1 -bottom-1">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Login Berhasil!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Window akan segera ditutup...
            </p>
          </div>

          {/* Loading Indicator */}
          <div className="w-full rounded-lg bg-green-50 p-4">
            <p className="text-xs text-green-700">
              Mohon tunggu sebentar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
