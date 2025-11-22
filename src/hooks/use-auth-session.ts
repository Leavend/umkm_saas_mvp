"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { User, UseAuthSessionReturn } from "~/lib/types";

/**
 * Custom hook for managing authentication session state
 * Provides type-safe access to user data and auth status
 */
export function useAuthSession(): UseAuthSessionReturn {
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

  return {
    user,
    isAuthenticated,
    isPending,
    error: null, // NextAuth doesn't provide error in useSession return
  };
}
