// src/components/auth/custom-auth-view.tsx

"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { Button } from "~/components/ui/button";
import { useParams } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { DEFAULT_LOCALE, normalizeLocale } from "~/lib/i18n";

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

  const redirectToPath = `/${lang}/dashboard`;

  const handleGoogleAuth = async () => {
    try {
      const origin = window.location.origin;
      const callbackURL = new URL(redirectToPath, origin).toString();
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      console.error("Google authentication failed:", error);
    }
  };

  if (!path) {
    return (
      <div className="flex grow items-center justify-center">
        <p>{loadingText}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <AuthView
        path={path}
        redirectTo={redirectToPath}
        localization={localization}
      />

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            {localization.OR ?? "or"}
          </span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <Button
        onClick={handleGoogleAuth}
        variant="outline"
        className="flex w-full items-center justify-center gap-2 py-2"
      >
        {/* SVG Google Icon */}
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {localization.GOOGLE_CONTINUE ?? "Continue with Google"}
      </Button>
    </div>
  );
}
