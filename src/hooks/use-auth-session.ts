"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { User, UseAuthSessionReturn } from "~/lib/types";

// Admin email whitelist - must match server-side admin-auth.ts
const ADMIN_EMAILS = ["tiohadybayu@gmail.com"];

/**
 * Custom hook for managing authentication session state
 * Provides type-safe access to user data and auth status
 */
export function useAuthSession(): UseAuthSessionReturn & { isAdmin: boolean } {
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const isAuthenticated = status === "authenticated";

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id ?? "",
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
        image: session.user.image ?? undefined,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const isAdmin = Boolean(
    isAuthenticated && user?.email && ADMIN_EMAILS.includes(user.email),
  );

  return {
    user,
    isAuthenticated,
    isPending,
    isAdmin,
    error: null,
  };
}
