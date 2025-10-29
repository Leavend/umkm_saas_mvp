// src/server/repositories/guest-repository.ts

import type { Prisma } from "@prisma/client";

import { db } from "~/server/db";

export const findGuestSessionById = async (id: string) =>
  db.guestSession.findUnique({
    where: { id },
    include: { projects: true },
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
    // Get guest session with projects
    const guestSession = await tx.guestSession.findUnique({
      where: { id: guestSessionId },
      include: { projects: true },
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

    // Transfer projects to user
    if (guestSession.projects.length > 0) {
      await tx.project.updateMany({
        where: { guestSessionId },
        data: {
          userId,
          guestSessionId: null,
        },
      });
    }

    // Delete the guest session
    await tx.guestSession.delete({
      where: { id: guestSessionId },
    });

    return {
      transferredCredits: guestSession.credits,
      transferredProjects: guestSession.projects.length,
    };
  });
};

export const createProjectForGuest = async (
  guestSessionId: string,
  data: Omit<Prisma.ProjectCreateArgs["data"], "guestSessionId">,
) => {
  return db.project.create({
    data: {
      name: data.name,
      imageUrl: data.imageUrl,
      imageKitId: data.imageKitId,
      filePath: data.filePath,
      guestSessionId,
      userId: null, // Set userId to null for guest projects
    },
  });
};

export const findProjectsByGuestSessionId = async (guestSessionId: string) =>
  db.project.findMany({
    where: { guestSessionId },
    orderBy: { createdAt: "desc" },
  });
