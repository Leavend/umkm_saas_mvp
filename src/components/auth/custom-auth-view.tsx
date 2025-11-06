// src/components/auth/custom-auth-view.tsx

"use client";

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
      <h2 className="text-center text-lg font-semibold">
        {localization.SIGN_IN ?? "Sign In"}
      </h2>
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
