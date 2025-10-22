// src/components/auth/auth-client-view.tsx

"use client";

import { AuthView } from "@daveyplate/better-auth-ui";

type AuthLocalization = Record<string, string | undefined>;

interface AuthClientViewProps {
  path: string | string[];
  loadingText: string;
  localization: AuthLocalization;
}

export function AuthClientView({
  path,
  loadingText,
  localization,
}: AuthClientViewProps) {
  const viewPath = Array.isArray(path) ? path.join("/") : path;

  const localizedCanonicalMap: Record<string, string> = {
    masuk: "sign-in",
    daftar: "sign-up",
  };

  const canonicalPath = viewPath ? localizedCanonicalMap[viewPath] ?? viewPath : viewPath;

  if (!canonicalPath) {
    return (
      <div className="flex grow items-center justify-center">
        <p>{loadingText}</p>
      </div>
    );
  }

  return (
    <AuthView
      path={canonicalPath as string}
      redirectTo="/dashboard"
      localization={localization}
    />
  );
}