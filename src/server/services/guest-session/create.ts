// Guest session creation operations

import { Prisma, type GuestSession } from "@prisma/client";
import { db } from "~/server/db";
import {
  INITIAL_GUEST_CREDITS,
  generateAccessToken,
  generateSessionSecret,
  generateFingerprint,
  computeExpiry,
} from "./constants";

export type CreateGuestSessionInput = {
  ipAddress?: string;
  userAgent?: string;
  fingerprint?: string;
};

/**
 * Create a new guest session with initial credits
 * Automatically retries with new fingerprint on collision
 */
export const createGuestSession = async (
  data?: CreateGuestSessionInput,
): Promise<GuestSession> => {
  const fingerprint = data?.fingerprint ?? generateFingerprint();
  const accessToken = generateAccessToken();
  const sessionSecret = generateSessionSecret();

  try {
    return await db.guestSession.create({
      data: {
        credits: INITIAL_GUEST_CREDITS,
        ipAddress: data?.ipAddress,
        userAgent: data?.userAgent,
        expiresAt: computeExpiry(),
        accessToken,
        sessionSecret,
        fingerprint,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Retry with freshly generated credentials on unique constraint collisions
      return await createGuestSession({
        ipAddress: data?.ipAddress,
        userAgent: data?.userAgent,
        fingerprint: generateFingerprint(),
      });
    }

    throw error;
  }
};

/**
 * Find an active (non-expired) guest session by ID
 */
export const findActiveGuestSession = async (id: string) =>
  db.guestSession.findFirst({
    where: {
      id,
      expiresAt: { gt: new Date() },
    },
  });

export type EnsureGuestSessionParams = {
  sessionId?: string | null;
  accessToken?: string | null;
  sessionSecret?: string | null;
  fingerprint?: string | null;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Ensure a valid guest session exists (create or reuse)
 * Returns session along with created/rotated flags
 */
export const ensureGuestSession = async (
  params: EnsureGuestSessionParams,
): Promise<{
  session: GuestSession;
  created: boolean;
  rotated: boolean;
}> => {
  const now = new Date();
  const nextExpiry = computeExpiry();

  const hasCredentialMatch =
    params.sessionId && params.accessToken && params.sessionSecret;

  // Try to find existing session with matching credentials
  if (hasCredentialMatch) {
    const existing = await db.guestSession.findFirst({
      where: {
        id: params.sessionId!,
        accessToken: params.accessToken!,
        sessionSecret: params.sessionSecret!,
      },
    });

    if (existing && existing.expiresAt > now) {
      const updated = await db.guestSession.update({
        where: { id: existing.id },
        data: {
          updatedAt: now,
          expiresAt: nextExpiry,
          ipAddress: params.ipAddress ?? existing.ipAddress,
          userAgent: params.userAgent ?? existing.userAgent,
        },
      });

      return { session: updated, created: false, rotated: false };
    }
  }

  // Try to find session by fingerprint
  const fingerprintValue = params.fingerprint ?? generateFingerprint();

  const fingerprintSession = await db.guestSession.findUnique({
    where: { fingerprint: fingerprintValue },
  });

  if (fingerprintSession) {
    const updated = await db.guestSession.update({
      where: { id: fingerprintSession.id },
      data: {
        updatedAt: now,
        expiresAt: nextExpiry,
        ipAddress: params.ipAddress ?? fingerprintSession.ipAddress,
        userAgent: params.userAgent ?? fingerprintSession.userAgent,
        accessToken: generateAccessToken(),
        sessionSecret: generateSessionSecret(),
      },
    });

    return { session: updated, created: false, rotated: true };
  }

  // Create new session
  const session = await createGuestSession({
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    fingerprint: fingerprintValue,
  });

  return { session, created: true, rotated: false };
};
