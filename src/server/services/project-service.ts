// src/server/services/project-service.ts

import {
  AppError,
  InsufficientCreditsError,
  NotFoundError,
  ValidationError,
} from "~/lib/errors";
import { err, ok, type Result } from "~/lib/result";
import { db } from "~/server/db";

export const deductCreditsForUser = async (
  userId: string,
  creditsToDeduct: number,
): Promise<Result<{ remainingCredits: number }>> => {
  if (!Number.isInteger(creditsToDeduct) || creditsToDeduct <= 0) {
    return err(new ValidationError("Invalid credit amount specified."));
  }

  try {
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

    return ok({ remainingCredits });
  } catch (error) {
    if (error instanceof AppError) {
      return err(error);
    }

    console.error("Unexpected error while deducting credits", error);
    return err(
      new AppError(
        "An unexpected error occurred while deducting credits. Please try again.",
      ),
    );
  }
};
