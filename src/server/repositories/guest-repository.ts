// src/server/repositories/guest-repository.ts

import { db } from "~/server/db";

export const findGuestSessionById = async (id: string) =>
  db.guestSession.findUnique({
    where: { id },
  });

export const findValidGuestSession = async (id: string) =>
  db.guestSession.findFirst({
    where: {
      id,
      expiresAt: { gt: new Date() },
    },
  });

export const migrateGuestSessionToUser = async (
  guestSessionId: string,
  userId: string,
) => {
  return db.$transaction(async (tx) => {
    // Get guest session
    const guestSession = await tx.guestSession.findUnique({
      where: { id: guestSessionId },
    });

    if (!guestSession) {
      throw new Error("Guest session not found");
    }

    // Transfer credits to user
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: { increment: guestSession.credits },
      },
    });

    // Delete the guest session
    await tx.guestSession.delete({
      where: { id: guestSessionId },
    });

    return {
      transferredCredits: guestSession.credits,
      transferredProjects: 0,
    };
  });
};
