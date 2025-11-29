// Guest session validation operations

import type { GuestSession } from "@prisma/client";
import { UnauthorizedError } from "~/lib/errors";
import { db } from "~/server/db";
import { computeExpiry } from "./constants";

export type GuestSessionCredentials = {
  sessionId?: string | null;
  accessToken?: string | null;
  sessionSecret?: string | null;
  fingerprint?: string | null;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Validate guest session credentials and extend expiry
 * Throws UnauthorizedError if credentials are invalid
 */
export const validateGuestSessionCredentials = async (
  credentials: GuestSessionCredentials,
): Promise<GuestSession> => {
  if (
    !credentials.sessionId ||
    !credentials.accessToken ||
    !credentials.sessionSecret
  ) {
    throw new UnauthorizedError("Missing guest session credentials");
  }

  const session = await db.guestSession.findFirst({
    where: {
      id: credentials.sessionId,
      accessToken: credentials.accessToken,
      sessionSecret: credentials.sessionSecret,
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) {
    throw new UnauthorizedError("Guest session invalid or expired");
  }

  if (
    credentials.fingerprint &&
    session.fingerprint !== credentials.fingerprint
  ) {
    throw new UnauthorizedError("Guest session fingerprint mismatch");
  }

  const nextExpiry = computeExpiry();

  return await db.guestSession.update({
    where: { id: session.id },
    data: {
      updatedAt: new Date(),
      expiresAt: nextExpiry,
      ipAddress: credentials.ipAddress ?? session.ipAddress,
      userAgent: credentials.userAgent ?? session.userAgent,
    },
  });
};
