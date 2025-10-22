// src/components/auth/auth-client-view.tsx

"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { useParams } from "next/navigation";

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
      redirectTo="/dashboard"
      localization={localization}
    />
  );
}