// src/components/auth/one-tap-trigger.tsx

"use client";

import { useEffect, useRef } from "react";
import {
  useSession,
  isGoogleOneTapEnabled,
  authClient,
} from "~/lib/auth-client";

interface OneTapTriggerProps {
  path: string;
}

export function OneTapTrigger({ path }: OneTapTriggerProps) {
  const { data: session, isPending } = useSession();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Only trigger One Tap if:
    // 1. User is not logged in
    // 2. One Tap is enabled
    // 3. We're on an auth page (sign-in or sign-up)
    // 4. We haven't triggered it yet
    // 5. Session is not pending

    if (
      session?.user ||
      !isGoogleOneTapEnabled ||
      (!path.includes("sign-in") && !path.includes("sign-up")) ||
      hasTriggeredRef.current ||
      isPending
    ) {
      return;
    }

    const triggerOneTap = async () => {
      try {
        hasTriggeredRef.current = true;

        await authClient.oneTap({
          callbackURL: `/${window.location.pathname.split("/")[1]}/dashboard`,
          onPromptNotification: (notification) => {
            console.log("One Tap prompt notification:", notification);
          },
        });
      } catch (error) {
        console.error("One Tap failed:", error);
        // Reset the trigger flag on error so it can be retried
        hasTriggeredRef.current = false;
      }
    };

    // Small delay to ensure the page is fully loaded
    const timeoutId = setTimeout(() => {
      void triggerOneTap();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [session?.user, path, isPending]);

  return null; // This component doesn't render anything
}
