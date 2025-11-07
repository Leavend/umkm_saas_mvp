import { useState, useEffect, useCallback } from "react";
import { useSession } from "~/lib/auth-client";
import { getUserCredits } from "~/actions/users";
import type { UseCreditsReturn } from "~/lib/types";
import { getErrorMessage } from "~/lib/errors";

/**
 * Custom hook for managing user credits with proper error handling
 * Automatically refreshes when user session changes
 */
export function useCredits(): UseCreditsReturn {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCredits = useCallback(async () => {
    // Let server action handle session validation
    // Client-side session data might be stale
    try {
      setIsLoading(true);
      setError(null);

      const userCredits = await getUserCredits();
      setCredits(userCredits);

      // Clear error on successful fetch
      if (userCredits !== null) {
        setError(null);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error("Failed to fetch credits:", errorMessage);
      setError(errorMessage);
      setCredits(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh credits when user changes (but not on every session update)
  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      void refreshCredits();
    } else {
      // Clear credits when user logs out
      setCredits(null);
      setError(null);
    }
  }, [session?.user?.id, refreshCredits]);

  return {
    credits,
    isLoading,
    error,
    refreshCredits,
  };
}
