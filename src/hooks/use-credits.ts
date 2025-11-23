import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "~/lib/auth-client";
import { getUserCredits } from "~/actions/users";
import type { UseCreditsReturn } from "~/lib/types";
import { extractErrorMessage } from "~/lib/utils";
import type { Session } from "next-auth";

/**
 * Extract credit loading logic into a separate function
 */
async function loadUserCredits(): Promise<number | null> {
  try {
    const userCredits = await getUserCredits();

    // Validate the returned credits value
    if (typeof userCredits === "number" && userCredits >= 0) {
      return userCredits;
    }

    throw new Error("Invalid credits data received");
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error("Failed to load user credits:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Removed custom SessionData interface – we now use NextAuth's Session type.

/**
 * Extract session change handler
 */
function useSessionChangeHandler(
  session: Session | null,
  refreshCredits: () => Promise<number | null>,
  setCredits: (value: number | null) => void,
  setError: (error: string | null) => void,
) {
  useEffect(() => {
    const userId = session?.user?.id;

    if (userId && typeof userId === "string") {
      // Only refresh if we have a valid user ID
      void refreshCredits();
    } else {
      // Clear state when user logs out or session is invalid
      setCredits(null);
      setError(null);
    }
  }, [session?.user?.id, refreshCredits, setCredits, setError]);
}

/**
 * Custom hook for managing user credits with proper error handling
 * Automatically refreshes when user session changes
 * with improved error handling and state management
 *
 * @returns Credit management state and actions
 */
export function useCredits(): UseCreditsReturn {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingPromise = useRef<Promise<number | null> | null>(null);

  const refreshCredits = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (loadingPromise.current) {
      return loadingPromise.current;
    }

    loadingPromise.current = (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userCredits = await loadUserCredits();
        setCredits(userCredits);
        setError(null);

        return userCredits;
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        setCredits(null);
        throw err;
      } finally {
        setIsLoading(false);
        loadingPromise.current = null;
      }
    })();

    return loadingPromise.current;
  }, []);

  // Refresh credits when user changes (but not on every session update)
  useSessionChangeHandler(session, refreshCredits, setCredits, setError);

  // Cleanup loading promise on unmount
  useEffect(() => {
    return () => {
      if (loadingPromise.current) {
        // Note: We can't cancel the promise, but we can prevent state updates
        // by checking if the component is still mounted
      }
    };
  }, []);

  return {
    credits,
    isLoading,
    error,
    refreshCredits,
  };
}
