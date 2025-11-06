// src/components/auth/one-tap-trigger.tsx
"use client";

// React import removed as useEffect is not used directly
import { useGoogleOneTap } from "~/hooks/use-google-one-tap";
import { exchangeGoogleIdToken } from "~/lib/google-auth";
import { toast } from "sonner";

interface OneTapTriggerProps {
  path: string;
}

export function OneTapTrigger({ path }: OneTapTriggerProps) {
  // Only trigger One Tap on sign-in pages
  const shouldTriggerOneTap =
    path.includes("/auth/signin") || path.includes("/login");

  useGoogleOneTap({
    renderTarget: null, // Don't render button, just trigger One Tap
    autoPrompt: shouldTriggerOneTap,
    onCredential: (credential) => {
      void (async () => {
        try {
          toast.loading("Memverifikasi kredensial Google...", {
            id: "google-onetap",
          });

          // Exchange the credential for a session
          await exchangeGoogleIdToken(credential, "/dashboard");

          toast.success("Login berhasil dengan Google One Tap! 🎉", {
            id: "google-onetap",
          });

          // Redirect to dashboard or refresh page
          window.location.href = "/dashboard";
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login gagal";
          toast.error(`One Tap login gagal: ${errorMessage}`, {
            id: "google-onetap",
          });
          console.error("One Tap authentication failed:", error);
        }
      })();
    },
    onError: (error) => {
      // Silent error for One Tap - don't show toast as it might be blocked by user
      console.warn(
        "Google One Tap error (this is normal if user dismissed it):",
        error.message,
      );
    },
  });

  // This component doesn't render anything visible
  return null;
}
