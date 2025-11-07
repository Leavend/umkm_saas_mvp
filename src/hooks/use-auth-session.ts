import { useEffect, useState } from "react";
import { useSession } from "~/lib/auth-client";
import type { User, UseAuthSessionReturn } from "~/lib/types";
import { getErrorMessage } from "~/lib/errors";

/**
 * Custom hook for managing authentication session state
 * Provides type-safe access to user data and auth status
 */
export function useAuthSession(): UseAuthSessionReturn {
  const { data: session, isPending, error } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Listen for popup auth success messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Type-safe message handling
      if (
        event.origin !== window.location.origin ||
        !event.data ||
        typeof event.data !== "object" ||
        !("type" in event.data)
      ) {
        return;
      }

      const data = event.data as { type: string };
      if (data.type === "GOOGLE_AUTH_SUCCESS") {
        console.log(
          "Auth success message received, session will refresh automatically",
        );
        // Better-auth handles session refresh automatically
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Sync with better-auth session state
  useEffect(() => {
    if (session?.user) {
      setIsAuthenticated(true);
      setUser(session.user as User);
    } else if (!isPending) {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [session, isPending]);

  return {
    user,
    isAuthenticated,
    isPending,
    error: error ? getErrorMessage(error) : null,
  };
}
