// src/hooks/use-credits.ts

import { useState, useEffect, useCallback } from "react";
import { useSession } from "~/lib/auth-client";
import { getUserCredits } from "~/actions/projects";
import type { UseCreditsReturn } from "~/lib/types";

/**
 * Custom hook for managing user credits
 */
export function useCredits(): UseCreditsReturn {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCredits = useCallback(async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      const result = await getUserCredits();

      if (result.success) {
        setCredits(result.credits);
      } else {
        console.error("Failed to fetch credits:", result.error);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  // Refresh credits when session changes
  useEffect(() => {
    void refreshCredits();
  }, [session?.user?.id, refreshCredits]);

  return {
    credits,
    isLoading,
    refreshCredits,
  };
}
