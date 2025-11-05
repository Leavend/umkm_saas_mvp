import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "~/lib/auth-client";
import { logError } from "~/lib/errors";

interface UseSignOutOptions {
  signOutRedirectPath: string;
  isSignOutView: boolean;
}

export function useSignOut({
  signOutRedirectPath,
  isSignOutView,
}: UseSignOutOptions) {
  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const signOutTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isSignOutView || sessionPending || signOutTriggeredRef.current) {
      return;
    }

    signOutTriggeredRef.current = true;

    const performSignOut = async () => {
      try {
        if (sessionData?.user) {
          await authClient.signOut();
        }
      } catch (error) {
        logError("Sign out failed", error);
      } finally {
        router.replace(signOutRedirectPath);
      }
    };

    void performSignOut();
  }, [isSignOutView, sessionPending, sessionData, router, signOutRedirectPath]);
}
