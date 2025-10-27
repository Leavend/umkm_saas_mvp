// src/components/auth/auth-client-view.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useLocalePath } from "~/components/language-provider";
import { useSession } from "~/lib/auth-client";

import { CustomAuthView } from "./custom-auth-view";

type AuthLocalization = Record<string, string | undefined>;

interface AuthClientViewProps {
  path: string;
  loadingText: string;
  localization: AuthLocalization;
}

export function AuthClientView({
  path,
  loadingText,
  localization,
}: AuthClientViewProps) {
  const router = useRouter();
  const toLocalePath = useLocalePath();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    router.replace(toLocalePath("/dashboard"));
  }, [router, toLocalePath, userId]);

  if (!path || isPending) {
    return (
      <div className="flex grow items-center justify-center">
        <p>{loadingText}</p>
      </div>
    );
  }

  if (userId) {
    return (
      <div className="flex grow items-center justify-center">
        <p>{loadingText}</p>
      </div>
    );
  }

  return (
    <CustomAuthView
      path={path}
      loadingText={loadingText}
      localization={localization}
    />
  );
}
