"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * OAuth Trigger Page
 * This page is opened in the popup and automatically triggers the OAuth flow
 * After successful auth, NextAuth will redirect to the callbackUrl (auth-success)
 */
export default function AuthTriggerPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/en/auth-success";

  useEffect(() => {
    // Automatically trigger Google OAuth when this page loads
    signIn("google", {
      callbackUrl,
      redirect: true,
    }).catch((error: Error) => {
      console.error("[AuthTrigger] Error:", error);
      // Notify parent window of error
      const opener = window.opener as Window | null;
      if (opener) {
        opener.postMessage(
          { type: "GOOGLE_AUTH_ERROR", error: error.message },
          window.location.origin,
        );
        setTimeout(() => {
          window.close();
        }, 500);
      }
    });
  }, [callbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Animated Loading Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-20"></div>
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Menghubungkan dengan Google
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Mohon tunggu sebentar...
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-full rounded-lg bg-blue-50 p-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-blue-200">
              <div className="h-full animate-[loading_2s_ease-in-out_infinite] bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
