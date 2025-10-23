// src/server/auth/session.ts

import { headers } from "next/headers";

import { auth } from "~/lib/auth";
import { UnauthorizedError } from "~/lib/errors";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUserId() {
  const session = await getServerSession();

  return session?.user?.id ?? null;
}

export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}
