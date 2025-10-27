import { Prisma } from "@prisma/client";

import { db } from "~/server/db";

const DAILY_CREDIT_AMOUNT = 1;

const getStartOfUtcDay = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

interface DailyCreditResult {
  credits: number;
  granted: boolean;
  lastDailyCreditAt: Date | null;
}

type CreditSnapshot = Pick<DailyCreditResult, "credits" | "lastDailyCreditAt">;

const fetchUserCreditSnapshot = (userId: string) =>
  db.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      lastDailyCreditAt: true,
    },
  });

export async function ensureDailyCreditForUser(
  userId: string,
  amount: number = DAILY_CREDIT_AMOUNT,
): Promise<DailyCreditResult> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Daily credit amount must be a positive integer");
  }

  const now = new Date();
  const startOfToday = getStartOfUtcDay(now);

  const updatedRows = await db.$queryRaw<CreditSnapshot[]>(
    Prisma.sql`
      UPDATE "user"
      SET "credits" = "credits" + ${amount},
          "lastDailyCreditAt" = ${now}
      WHERE "id" = ${userId}
        AND (
          "lastDailyCreditAt" IS NULL
          OR "lastDailyCreditAt" < ${startOfToday}
        )
      RETURNING "credits", "lastDailyCreditAt"
    `,
  );

  const [updatedUser] = updatedRows;

  if (updatedUser) {
    return {
      credits: updatedUser.credits,
      granted: true,
      lastDailyCreditAt: updatedUser.lastDailyCreditAt,
    };
  }

  const existingUser = await fetchUserCreditSnapshot(userId);

  if (!existingUser) {
    throw new Error("User not found while ensuring daily credit");
  }

  return {
    credits: existingUser.credits,
    granted: false,
    lastDailyCreditAt: existingUser.lastDailyCreditAt,
  };
}
