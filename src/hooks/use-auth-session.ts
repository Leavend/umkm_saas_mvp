import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "~/lib/auth-client";
import type { User, UseAuthSessionReturn } from "~/lib/types";
import { extractErrorMessage } from "~/lib/utils";

interface SessionData {
  user: {
    id: string;
    name?: string;
    email?: string;
    emailVerified?: boolean;
    image?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
  session: {
    id: string;
    expiresAt?: Date;
    token?: string;
    createdAt?: Date;
    updatedAt?: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Map better-auth session to our User type
 */
function mapSessionUser(
  sessionUser: SessionData["user"] | undefined,
): User | null {
  if (!sessionUser) return null;

  return {
    id: sessionUser.id,
    name: sessionUser.name ?? undefined,
    email: sessionUser.email ?? undefined,
    image: sessionUser.image ?? undefined,
  };
}

/**
 * Extract message event handling into a separate function
 */
function useMessageListener() {
  const sessionRefreshRequested = useRef(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    // Type-safe message handling with origin check
    if (
      event.origin !== window.location.origin ||
      !event.data ||
      typeof event.data !== "object" ||
      !("type" in event.data)
    ) {
      return;
    }

    const data = event.data as { type: string };

    switch (data.type) {
      case "GOOGLE_AUTH_SUCCESS":
        if (!sessionRefreshRequested.current) {
          console.log(
            "Auth success message received, session will refresh automatically",
          );
          sessionRefreshRequested.current = true;
          // Better-auth handles session refresh automatically
          setTimeout(() => {
            sessionRefreshRequested.current = false;
          }, 2000);
        }
        break;
      default:
        // Ignore unknown message types
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);
}

/**
 * Extract session synchronization logic
 */
function useSessionSync(
  session: SessionData | null,
  isPending: boolean,
  setIsAuthenticated: (value: boolean) => void,
  setUser: (user: User | null) => void,
) {
  useEffect(() => {
    if (session?.user && typeof session.user === "object") {
      setIsAuthenticated(true);
      setUser(mapSessionUser(session.user));
    } else if (!isPending) {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [session, isPending, setIsAuthenticated, setUser]);
}

/**
 * Custom hook for managing authentication session state
 * Provides type-safe access to user data and auth status
 * with improved error handling and performance optimizations
 */
export function useAuthSession(): UseAuthSessionReturn {
  const { data: session, isPending, error } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Listen for popup auth success messages
  useMessageListener();

  // Sync with better-auth session state
  useSessionSync(session, isPending, setIsAuthenticated, setUser);

  // Memoize error message to prevent unnecessary re-renders
  const errorMessage = error ? extractErrorMessage(error) : null;

  return {
    user,
    isAuthenticated,
    isPending,
    error: errorMessage,
  };
}
