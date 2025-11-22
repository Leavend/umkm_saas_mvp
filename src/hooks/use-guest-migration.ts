"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function useGuestMigration() {
  const { data: session } = useSession();

  useEffect(() => {
    const handleGuestMigration = async () => {
      try {
        // Check if user just signed up and has a guest session
        if (session?.user) {
          // Check if guest session cookie exists
          const hasGuestSession = document.cookie
            .split("; ")
            .find((row) => row.startsWith("guest_session_id="));

          if (hasGuestSession) {
            // Trigger migration
            const response = await fetch("/api/auth/migrate-guest", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              // Guest session migrated successfully
              await response.json();
            } else {
              console.error("Guest migration failed");
            }
          }
        }
      } catch (error) {
        console.error("Guest migration error:", error);
      }
    };

    // Run migration check when component mounts or session changes
    void handleGuestMigration();
  }, [session]);
}
