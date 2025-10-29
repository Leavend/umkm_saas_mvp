"use client";

import { type ReactNode } from "react";
import { useGuestMigration } from "~/hooks/use-guest-migration";

interface AuthProviderWithMigrationProps {
  children: ReactNode;
}

export function AuthProviderWithMigration({
  children,
}: AuthProviderWithMigrationProps) {
  useGuestMigration();

  return <>{children}</>;
}
