// src/server/services/project-service.ts

import type { Project } from "@prisma/client";

import { DEFAULT_LOCALE, TRANSLATIONS } from "~/lib/i18n";
import {
  AppError,
  InsufficientCreditsError,
  NotFoundError,
  ValidationError,
} from "~/lib/errors";
import { err, ok, type Result } from "~/lib/result";
import { db } from "~/server/db";
import {
  createProject,
  type CreateProjectInput,
  findProjectsByUserId,
} from "~/server/repositories/project-repository";

const FALLBACK_PROJECT_NAME = "Untitled Project";
const DEFAULT_PROJECT_NAME =
  TRANSLATIONS[DEFAULT_LOCALE]?.projects?.card?.untitled ??
  FALLBACK_PROJECT_NAME;

export interface CreateProjectParams {
  userId: string;
  imageUrl: string;
  imageKitId: string;
  filePath: string;
  name?: string;
}

const sanitizeProjectName = (name?: string) =>
  name?.trim() ? name.trim() : DEFAULT_PROJECT_NAME;

export const createProjectForUser = async (
  params: CreateProjectParams,
): Promise<Result<Project>> => {
  const payload: CreateProjectInput = {
    userId: params.userId,
    imageUrl: params.imageUrl,
    imageKitId: params.imageKitId,
    filePath: params.filePath,
    name: sanitizeProjectName(params.name),
  };

  try {
    const project = await createProject(payload);
    return ok(project);
  } catch (error) {
    console.error("Failed to create project", error);
    return err(new AppError("Failed to create project"));
  }
};

export const listProjectsForUser = async (
  userId: string,
): Promise<Result<Project[]>> => {
  try {
    const projects = await findProjectsByUserId(userId);
    return ok(projects);
  } catch (error) {
    console.error("Failed to fetch projects", error);
    return err(new AppError("Failed to fetch projects"));
  }
};

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
