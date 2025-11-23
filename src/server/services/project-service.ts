// src/server/services/project-service.ts

import {
  InsufficientCreditsError,
  NotFoundError,
  ValidationError,
} from "~/lib/errors";
import { db } from "~/server/db";

export const deductCreditsForUser = async (
  userId: string,
  creditsToDeduct: number,
): Promise<{ remainingCredits: number }> => {
  if (!Number.isInteger(creditsToDeduct) || creditsToDeduct <= 0) {
    throw new ValidationError("Invalid credit amount specified.");
  }

  const remainingCredits = await db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new NotFoundError("User not found during credit update.");
    }

    if (user.credits < creditsToDeduct) {
      throw new InsufficientCreditsError();
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: creditsToDeduct,
        },
      },
      select: { credits: true },
    });

    return updatedUser.credits;
  });

  return { remainingCredits };
};
