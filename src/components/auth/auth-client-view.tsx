// src/components/auth/auth-client-view.tsx

"use client";

import { AuthView } from "@daveyplate/better-auth-ui";

import { useLanguage } from "~/components/language-provider";
import { createLocalePath } from "~/lib/locale-path";

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
  const { locale } = useLanguage();

  const viewPath = Array.isArray(path) ? path.join("/") : path;

  if (!viewPath) {
    return (
      <div className="flex grow items-center justify-center">
        <p>{loadingText}</p>
      </div>
    );
  }

  return (
    <AuthView
      path={viewPath as string}
      redirectTo={createLocalePath(locale, "/dashboard")}
      localization={localization}
    />
  );
}