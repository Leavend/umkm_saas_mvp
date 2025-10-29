// src/actions/projects.tsx

"use server";

import type { Project } from "@prisma/client";
import {
  deductCreditsForUser,
  listProjectsForUser,
  createProjectForUser,
  createProjectForGuest,
  type CreateProjectParams,
} from "~/server/services/project-service";
import {
  getSessionContext,
  requireSessionContext,
} from "~/server/auth/unified-session";
import { findProjectsByGuestSessionId } from "~/server/repositories/guest-repository";
import {
  AppError,
  InsufficientCreditsError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  logError,
} from "~/lib/errors";
import {
  adjustGuestCredits,
  ensureDailyCreditForGuest,
} from "~/server/services/guest-session-service";
import { ensureDailyCreditForUser } from "~/server/services/user-service";

type ActionError = {
  success: false;
  error: string;
};

type CreateProjectSuccess = {
  success: true;
  project: Project;
};

type ProjectListSuccess = {
  success: true;
  projects: Project[];
};

type CreditSuccess = {
  success: true;
  credits: number;
};

type CreditDeductionSuccess = {
  success: true;
  remainingCredits: number;
};

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

export async function createProject(
  data: Omit<CreateProjectParams, "userId">,
): Promise<CreateProjectSuccess | ActionError> {
  try {
    const context = await requireSessionContext();

    if (context.type === "user") {
      // Create project for authenticated user
      const userResult = await createProjectForUser({
        ...data,
        userId: context.userId,
      });

      if (!userResult.ok) {
        return {
          success: false,
          error: mapServiceErrorToMessage(userResult.error),
        };
      }

      return { success: true, project: userResult.value };
    } else {
      // context.type === "guest"
      await ensureDailyCreditForGuest(context.guestSession.id);

      const guestResult = await createProjectForGuest({
        ...data,
        guestSessionId: context.guestSession.id,
      });

      if (!guestResult.ok) {
        return {
          success: false,
          error: mapServiceErrorToMessage(guestResult.error),
        };
      }

      return { success: true, project: guestResult.value };
    }
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Authentication required")
    ) {
      return {
        success: false,
        error: "Unauthorized access. Please sign in or try as guest.",
      };
    }

    if (error instanceof AppError) {
      return {
        success: false,
        error: mapServiceErrorToMessage(error),
      };
    }

    logError("Project creation error:", error);
    return {
      success: false,
      error: "Failed to create project. Please try again.",
    };
  }
}

export async function getUserProjects(): Promise<
  ProjectListSuccess | ActionError
> {
  try {
    const context = await getSessionContext();

    if (context.type === "none") {
      console.warn("getUserProjects called without active session.");
      return { success: true, projects: [] };
    }

    if (context.type === "user") {
      // Get projects for authenticated user
      const result = await listProjectsForUser(context.userId);

      if (!result.ok) {
        return {
          success: false,
          error: mapServiceErrorToMessage(result.error),
        };
      }

      return { success: true, projects: result.value };
    } else {
      // context.type === "guest"
      await ensureDailyCreditForGuest(context.guestSession.id);
      const projects = await findProjectsByGuestSessionId(
        context.guestSession.id,
      );
      return { success: true, projects };
    }
  } catch (error: unknown) {
    logError("Projects fetch error:", error);
    return {
      success: false,
      error: "Failed to fetch projects. Please try again.",
    };
  }
}

export async function getUserCredits(): Promise<CreditSuccess | ActionError> {
  try {
    const context = await getSessionContext();

    if (context.type === "none") {
      return { success: false, error: "No active session found." };
    }

    if (context.type === "user") {
      // Get credits for authenticated user, ensuring daily grant
      const { credits } = await ensureDailyCreditForUser(context.userId);
      return { success: true, credits };
    } else {
      // context.type === "guest"
      const { credits } = await ensureDailyCreditForGuest(
        context.guestSession.id,
      );
      return { success: true, credits };
    }
  } catch (error: unknown) {
    logError("Credits fetch error:", error);
    return {
      success: false,
      error: "Failed to fetch credits. Please try again.",
    };
  }
}

export async function deductCredits(
  creditsToDeduct: number,
  operation?: string,
): Promise<CreditDeductionSuccess | ActionError> {
  try {
    const context = await requireSessionContext();

    if (context.type === "user") {
      // Deduct credits for authenticated user
      const result = await deductCreditsForUser(
        context.userId,
        creditsToDeduct,
      );

      if (!result.ok) {
        const errorMessage = mapServiceErrorToMessage(result.error);
        logError(
          `Credit deduction error${
            operation ? ` for operation: ${operation}` : ""
          }: ${errorMessage}`,
          result.error,
        );
        return { success: false, error: errorMessage };
      }

      return { success: true, remainingCredits: result.value.remainingCredits };
    } else {
      // context.type === "guest"
      await ensureDailyCreditForGuest(context.guestSession.id);
      const updatedGuestSession = await adjustGuestCredits(
        context.guestSession.id,
        -creditsToDeduct,
      );

      return {
        success: true,
        remainingCredits: updatedGuestSession.credits,
      };
    }
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Authentication required")
    ) {
      console.warn("deductCredits called without active session.");
      return {
        success: false,
        error: "Unauthorized access. Please sign in or try as guest.",
      };
    }

    if (error instanceof AppError) {
      const message = mapServiceErrorToMessage(error);
      logError(
        `Credit deduction error${
          operation ? ` for operation: ${operation}` : ""
        }: ${message}`,
        error,
      );
      return { success: false, error: message };
    }

    logError(
      `Credit deduction error${
        operation ? ` for operation: ${operation}` : ""
      }:`,
      error,
    );

    return {
      success: false,
      error:
        "An unexpected error occurred while deducting credits. Please try again.",
    };
  }
}
