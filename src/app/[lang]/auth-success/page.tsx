"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { useTranslations } from "~/components/language-provider";
import { useSession } from "next-auth/react";
import { trackUserSignup } from "~/lib/analytics-helpers";

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
  const pathname = usePathname();
  const translations = useTranslations();
  const t = translations.auth.authSuccess;
  const { data: session } = useSession();

  // Extract locale from pathname (e.g., /en/auth-success -> en)
  const locale = pathname.split("/")[1] ?? "en";
  const homeUrl = `/${locale}`;

  useEffect(() => {
    handleAuthSuccess(session, homeUrl);
  }, [session, homeUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Success Icon with Loading */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Check className="h-11 w-11 text-green-600" strokeWidth={3} />
            </div>
            <div className="absolute -right-1 -bottom-1">
              <Loader2 className="h-7 w-7 animate-spin text-[#D97706]" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="mt-2 text-base text-gray-600">{t.closing}</p>
          </div>

          {/* Loading Indicator */}
          <div className="w-full rounded-xl bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">{t.pleaseWait}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function handleAuthSuccess(session: any, homeUrl: string) {
  // Get target window (popup opener or iframe parent)
  const targetWindow = (window.opener ?? window.parent) as Window | null;

  if (targetWindow && targetWindow !== window) {
    try {
      // Track user signup
      if (session?.user?.id) {
        trackUserSignup("google", session.user.id);
      }

      // Send success message to parent window
      targetWindow.postMessage(
        {
          type: "GOOGLE_AUTH_SUCCESS",
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
          window.location.href = homeUrl;
        }, 2000);
      }
    } catch (error) {
      // If postMessage fails (cross-origin), fallback to redirect
      console.error("Failed to send auth success message:", error);
      setTimeout(() => {
        window.location.href = homeUrl;
      }, 1500);
    }
  } else {
    // No parent window found, redirect to home
    setTimeout(() => {
      window.location.href = homeUrl;
    }, 1500);
  }
}
