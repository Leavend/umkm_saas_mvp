// src/actions/projects.tsx

"use server";

import {
  deductCreditsForUser,
  listProjectsForUser,
  createProjectForUser,
  type CreateProjectParams,
} from "~/server/services/project-service";
import { getCurrentUserId } from "~/server/auth/session";
import {
  AppError,
  InsufficientCreditsError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "~/lib/errors";

const mapServiceErrorToMessage = (error: AppError) => {
  if (error instanceof UnauthorizedError) {
    return "Unauthorized access. Please sign in.";
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof InsufficientCreditsError) {
    return "Insufficient credits.";
  }

  if (error instanceof NotFoundError) {
    return "Unable to complete the request. Please try again.";
  }

  return error.message;
};

export async function createProject(data: Omit<CreateProjectParams, "userId">) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized access. Please sign in.",
      };
    }

    const result = await createProjectForUser({
      ...data,
      userId,
    });

    if (!result.ok) {
      return {
        success: false,
        error: mapServiceErrorToMessage(result.error),
      };
    }

    return { success: true, project: result.value };
  } catch (error) {
    console.error("Project creation error:", error);
    return {
      success: false,
      error: "Failed to create project. Please try again.",
    };
  }
}

export async function getUserProjects() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      console.warn("getUserProjects called without active session.");
      return { success: true, projects: [] };
    }

    const result = await listProjectsForUser(userId);

    if (!result.ok) {
      return {
        success: false,
        error: mapServiceErrorToMessage(result.error),
      };
    }

    return { success: true, projects: result.value };
  } catch (error) {
    console.error("Projects fetch error:", error);
    return {
      success: false,
      error: "Failed to fetch projects. Please try again.",
    };
  }
}

export async function deductCredits(
  creditsToDeduct: number,
  operation?: string,
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      console.warn("deductCredits called without active session.");
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    const result = await deductCreditsForUser(userId, creditsToDeduct);

    if (!result.ok) {
      const errorMessage = mapServiceErrorToMessage(result.error);
      console.error(
        `Credit deduction error${
          operation ? ` for operation: ${operation}` : ""
        }: ${errorMessage}`,
      );
      return { success: false, error: errorMessage };
    }

    return { success: true, remainingCredits: result.value.remainingCredits };
  } catch (error) {
    console.error(
      `Credit deduction error${operation ? ` for operation: ${operation}` : ""}:`,
      error,
    );

    return {
      success: false,
      error:
        "An unexpected error occurred while deducting credits. Please try again.",
    };
  }
}
