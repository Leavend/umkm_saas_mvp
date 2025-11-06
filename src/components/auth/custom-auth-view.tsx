// src/components/auth/custom-auth-view.tsx

"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { useParams, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, normalizeLocale } from "~/lib/i18n";
import { useSignOut } from "~/hooks/use-sign-out";
import { useEffect } from "react";

interface CustomAuthViewProps {
  path: string;
  loadingText: string;
  localization: Record<string, string | undefined>;
}

export function CustomAuthView({
  path,
  loadingText,
  localization,
}: CustomAuthViewProps) {
  const params = useParams<{ lang?: string }>();
  const router = useRouter();
  const lang = normalizeLocale(params?.lang, DEFAULT_LOCALE);

  const redirectToPath = `/${lang}/dashboard`;
  const signOutRedirectPath = `/${lang}/auth/sign-in`;
  const normalizedPath = path?.split("?")[0] ?? "";
  const isSignOutView = normalizedPath === "sign-out";

  useSignOut({
    signOutRedirectPath,
    isSignOutView,
  });

  useEffect(() => {
    // Define global callback for Google Identity Services
    const handleCredentialResponse = async (response: {
      credential: string;
    }) => {
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential: response.credential }),
        });
        if (res.ok) {
          router.push(redirectToPath);
        } else {
          console.error("Google sign-in failed");
        }
      } catch (error) {
        console.error("Error during Google sign-in:", error);
      }
    };

    (window as any).handleCredentialResponse = handleCredentialResponse;

    // Initialize Google Sign-In
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
      });
    }

    return () => {
      // Cleanup
      delete (window as any).handleCredentialResponse;
    };
  }, [router, redirectToPath]);

  if (!path || isSignOutView) {
    return (
      <div className="flex grow items-center justify-center">
        <p>{loadingText}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <h2 className="text-center text-lg font-semibold">
        {localization.SIGN_IN ?? "Sign In"}
      </h2>
      {/* Google Identity Services Sign In */}
      <div
        id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        data-callback="handleCredentialResponse"
        data-auto_prompt="false"
      ></div>
      <div
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="continue_with"
        data-shape="rectangular"
        data-logo_alignment="left"
      ></div>
    </div>
  );
}
