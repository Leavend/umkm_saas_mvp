// src/components/auth/auth-client-view.tsx
"use client";

import { useParams } from "next/navigation";
import type { Locale } from "~/lib/i18n";
import { CustomAuthView } from "./custom-auth-view";

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
  const params = useParams();
  const lang = (params.lang as Locale) || "id";

  const viewPath = Array.isArray(path) ? path.join("/") : path;

  if (!viewPath) {
    return (
      <div className="flex grow items-center justify-center">
        <p>{loadingText}</p>
      </div>
    );
  }

  // Use CustomAuthView instead of AuthView directly
  return (
    <CustomAuthView
      path={viewPath}
      loadingText={loadingText}
      localization={localization}
    />
  );
}
