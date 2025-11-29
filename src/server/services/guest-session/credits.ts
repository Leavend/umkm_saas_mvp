// Guest session credit management and migration operations

import { Prisma } from "@prisma/client";
import { InsufficientCreditsError, NotFoundError } from "~/lib/errors";
import { db } from "~/server/db";
import {
  DAILY_CREDIT_AMOUNT,
  DAILY_CREDIT_CAP,
  getStartOfUtcDay,
  computeExpiry,
} from "./constants";

export type GuestCreditResult = {
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

/**
 * Grant daily credit to guest if eligible
 * Returns credit info with granted flag
 */
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

/**
 * Adjust guest credits by delta amount
 * Throws InsufficientCreditsError if result would be negative
 */
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
