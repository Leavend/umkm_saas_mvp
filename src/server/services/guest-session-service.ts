import { randomBytes } from "node:crypto";
import { Prisma, type GuestSession } from "@prisma/client";

import {
  InsufficientCreditsError,
  NotFoundError,
  UnauthorizedError,
} from "~/lib/errors";
import { db } from "~/server/db";
import { AUTH_CONFIG } from "~/lib/auth-config";

const INITIAL_GUEST_CREDITS = AUTH_CONFIG.credits.initialGuest;
const DAILY_CREDIT_AMOUNT = AUTH_CONFIG.credits.dailyAmount;
const DAILY_CREDIT_CAP = AUTH_CONFIG.credits.dailyCap;
const SESSION_TTL_MS = AUTH_CONFIG.session.ttlMs;
const ACCESS_TOKEN_BYTES = 32;
const SESSION_SECRET_BYTES = 32;
const FINGERPRINT_BYTES = 16;

export const GUEST_SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);

const generateHex = (bytes: number): string =>
  randomBytes(bytes).toString("hex");
const generateAccessToken = (): string => generateHex(ACCESS_TOKEN_BYTES);
const generateSessionSecret = (): string => generateHex(SESSION_SECRET_BYTES);
const generateFingerprint = (): string => generateHex(FINGERPRINT_BYTES);

const getStartOfUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const computeExpiry = (): Date => new Date(Date.now() + SESSION_TTL_MS);

type CreateGuestSessionInput = {
  ipAddress?: string;
  userAgent?: string;
  fingerprint?: string;
};

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

  const session = await createGuestSession({
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    fingerprint: fingerprintValue,
  });

  return { session, created: true, rotated: false };
};

export type GuestSessionCredentials = {
  sessionId?: string | null;
  accessToken?: string | null;
  sessionSecret?: string | null;
  fingerprint?: string | null;
  ipAddress?: string;
  userAgent?: string;
};

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

type GuestCreditResult = {
  credits: number;
  granted: boolean;
  lastDailyCreditAt: Date | null;
};

type GuestCreditSnapshot = {
  credits: number;
  lastDailyCreditAt: Date | null;
};

const isGuestCreditSnapshot = (
  value: unknown,
): value is GuestCreditSnapshot => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as {
    credits?: unknown;
    lastDailyCreditAt?: unknown;
  };

  return typeof candidate.credits === "number";
};

export const ensureDailyCreditForGuest = async (guestSessionId: string) => {
  const now = new Date();
  const startOfToday = getStartOfUtcDay(now);
  const nextExpiry = computeExpiry();

  return db.$transaction<GuestCreditResult>(async (tx) => {
    const updatedRows = await tx.$queryRaw<GuestCreditSnapshot[]>(
      Prisma.sql`
        UPDATE "guest_session"
        SET "credits" = LEAST("credits" + ${DAILY_CREDIT_AMOUNT}, ${DAILY_CREDIT_CAP}),
            "lastDailyCreditAt" = ${now},
            "updatedAt" = ${now},
            "expiresAt" = ${nextExpiry}
        WHERE "id" = ${guestSessionId}
          AND "expiresAt" > ${now}
          AND "credits" < ${DAILY_CREDIT_CAP}
          AND (
            "lastDailyCreditAt" IS NULL
            OR "lastDailyCreditAt" < ${startOfToday}
          )
        RETURNING "credits", "lastDailyCreditAt"
      `,
    );

    const [updated] = updatedRows;

    if (updated) {
      return {
        credits: updated.credits,
        granted: true,
        lastDailyCreditAt: updated.lastDailyCreditAt,
      } satisfies GuestCreditResult;
    }

    const existing = await tx.guestSession.findFirst({
      where: {
        id: guestSessionId,
        expiresAt: { gt: now },
      },
      select: {
        credits: true,
        lastDailyCreditAt: true,
      },
    });

    if (!isGuestCreditSnapshot(existing)) {
      throw new NotFoundError("Guest session not found or expired");
    }

    await tx.guestSession.update({
      where: { id: guestSessionId },
      data: {
        updatedAt: now,
        expiresAt: nextExpiry,
      },
    });

    return {
      credits: existing.credits,
      granted: false,
      lastDailyCreditAt: existing.lastDailyCreditAt ?? null,
    } satisfies GuestCreditResult;
  });
};

export const adjustGuestCredits = async (
  guestSessionId: string,
  delta: number,
) => {
  if (!Number.isInteger(delta) || delta === 0) {
    throw new Error("Credit delta must be a non-zero integer");
  }

  const now = new Date();
  const nextExpiry = computeExpiry();

  const updated = await db.$transaction<{ credits: number }>(async (tx) => {
    const session = await tx.guestSession.findFirst({
      where: {
        id: guestSessionId,
        expiresAt: { gt: now },
      },
      select: {
        credits: true,
      },
    });

    if (!session) {
      throw new NotFoundError("Guest session not found or expired");
    }

    const nextCredits = session.credits + delta;

    if (nextCredits < 0) {
      throw new InsufficientCreditsError();
    }

    return tx.guestSession.update({
      where: { id: guestSessionId },
      data: {
        credits: nextCredits,
        updatedAt: now,
        expiresAt: nextExpiry,
      },
      select: {
        credits: true,
      },
    });
  });

  return updated;
};
