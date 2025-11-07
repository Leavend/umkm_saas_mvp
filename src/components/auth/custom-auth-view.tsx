// src/components/auth/custom-auth-view.tsx

"use client";

import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, normalizeLocale } from "~/lib/i18n";
import { useSignOut } from "~/hooks/use-sign-out";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { GoogleIcon } from "~/components/icons/google-icon";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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
  const lang = normalizeLocale(params?.lang, DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(false);

  const redirectToPath = `/${lang}`;
  const signOutRedirectPath = `/${lang}/auth/sign-in`;
  const normalizedPath = path?.split("?")[0] ?? "";
  const isSignOutView = normalizedPath === "sign-out";

  useSignOut({
    signOutRedirectPath,
    isSignOutView,
  });

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Use better-auth's signIn function for Google OAuth
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectToPath,
      });
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      {/* Better-auth Google Sign In Button */}
      <Button
        onClick={handleGoogleSignIn}
        variant="default"
        className="flex w-full items-center justify-center gap-3 text-base font-medium transition-all hover:shadow-lg"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="h-5 w-5" />
            <span>Continue with Google</span>
          </>
        )}
      </Button>
    </div>
  );
}
