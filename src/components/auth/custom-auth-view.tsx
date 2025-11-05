// src/components/auth/custom-auth-view.tsx

"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { Button } from "~/components/ui/button";

import { useParams, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, normalizeLocale } from "~/lib/i18n";
import { useGoogleAuth } from "~/hooks/use-google-auth";
import { GoogleIcon } from "~/components/icons/google-icon";
import { useSignOut } from "~/hooks/use-sign-out";

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

  const { signInWithGoogle } = useGoogleAuth({
    onSuccess: () => router.push(redirectToPath),
  });

  useSignOut({
    signOutRedirectPath,
    isSignOutView,
  });

  if (!path || isSignOutView) {
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
        onClick={signInWithGoogle}
        variant="outline"
        className="flex w-full items-center justify-center gap-2 py-2"
      >
        <GoogleIcon className="h-4 w-4" />
        {localization.GOOGLE_CONTINUE ?? "Continue with Google"}
      </Button>
    </div>
  );
}
