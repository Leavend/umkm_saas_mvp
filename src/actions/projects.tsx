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
import { getCurrentUserId } from "~/server/auth/session";
import { getGuestSessionCredentials } from "~/server/auth/guest-session";
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
  validateGuestSessionCredentials,
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
    const userId = await getCurrentUserId();
    const guestCredentials = await getGuestSessionCredentials();

    if (!userId && !guestCredentials.sessionId) {
      return {
        success: false,
        error: "Unauthorized access. Please sign in or try as guest.",
      };
    }

    if (userId) {
      // Create project for authenticated user
      const userResult = await createProjectForUser({
        ...data,
        userId,
      });

      if (!userResult.ok) {
        return {
          success: false,
          error: mapServiceErrorToMessage(userResult.error),
        };
      }

      return { success: true, project: userResult.value };
    } else if (guestCredentials.sessionId) {
      let guestSession: Awaited<
        ReturnType<typeof validateGuestSessionCredentials>
      > | null = null;
      try {
        guestSession = await validateGuestSessionCredentials(guestCredentials);
        await ensureDailyCreditForGuest(guestSession.id);
      } catch (error: unknown) {
        if (error instanceof AppError) {
          return {
            success: false,
            error: mapServiceErrorToMessage(error),
          };
        }

        logError("Guest session validation failed", error);
        return {
          success: false,
          error: "Guest session expired. Please refresh to continue.",
        };
      }

      if (!guestSession) {
        return {
          success: false,
          error: "Guest session expired. Please refresh to continue.",
        };
      }

      const guestResult = await createProjectForGuest({
        ...data,
        guestSessionId: guestSession.id,
      });

      if (!guestResult.ok) {
        return {
          success: false,
          error: mapServiceErrorToMessage(guestResult.error),
        };
      }

      return { success: true, project: guestResult.value };
    }

    return {
      success: false,
      error: "Unable to determine session context. Please try again.",
    };
  } catch (error: unknown) {
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
    const userId = await getCurrentUserId();
    const guestCredentials = await getGuestSessionCredentials();

    if (!userId && !guestCredentials.sessionId) {
      console.warn("getUserProjects called without active session.");
      return { success: true, projects: [] };
    }

    if (userId) {
      // Get projects for authenticated user
      const result = await listProjectsForUser(userId);

      if (!result.ok) {
        return {
          success: false,
          error: mapServiceErrorToMessage(result.error),
        };
      }

      return { success: true, projects: result.value };
    } else if (guestCredentials.sessionId) {
      let guestSession: Awaited<
        ReturnType<typeof validateGuestSessionCredentials>
      > | null = null;
      try {
        guestSession = await validateGuestSessionCredentials(guestCredentials);
        await ensureDailyCreditForGuest(guestSession.id);
        const projects = await findProjectsByGuestSessionId(guestSession.id);
        return { success: true, projects };
      } catch (error: unknown) {
        if (error instanceof AppError) {
          return { success: false, error: mapServiceErrorToMessage(error) };
        }

        logError("Guest projects fetch error", error);
        return {
          success: false,
          error: "Guest session expired. Please refresh to continue.",
        };
      }
    }

    return {
      success: false,
      error: "Unable to determine session context. Please try again.",
    };
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
    const userId = await getCurrentUserId();
    const guestCredentials = await getGuestSessionCredentials();

    if (!userId && !guestCredentials.sessionId) {
      return { success: false, error: "No active session found." };
    }

    if (userId) {
      // Get credits for authenticated user, ensuring daily grant
      const { credits } = await ensureDailyCreditForUser(userId);
      return { success: true, credits };
    } else if (guestCredentials.sessionId) {
      try {
        const guestSession =
          await validateGuestSessionCredentials(guestCredentials);
        const { credits } = await ensureDailyCreditForGuest(guestSession.id);
        return { success: true, credits };
      } catch (error: unknown) {
        if (error instanceof AppError) {
          return { success: false, error: mapServiceErrorToMessage(error) };
        }

        logError("Guest credits fetch error", error);
        return { success: false, error: "Guest session expired." };
      }
    }

    return { success: false, error: "Unable to determine session context." };
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
    const userId = await getCurrentUserId();
    const guestCredentials = await getGuestSessionCredentials();

    if (!userId && !guestCredentials.sessionId) {
      console.warn("deductCredits called without active session.");
      return {
        success: false,
        error: "Unauthorized access. Please sign in or try as guest.",
      };
    }

    if (userId) {
      // Deduct credits for authenticated user
      const result = await deductCreditsForUser(userId, creditsToDeduct);

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
    } else if (guestCredentials.sessionId) {
      try {
        const guestSession =
          await validateGuestSessionCredentials(guestCredentials);
        await ensureDailyCreditForGuest(guestSession.id);
        const updatedGuestSession = await adjustGuestCredits(
          guestSession.id,
          -creditsToDeduct,
        );

        return {
          success: true,
          remainingCredits: updatedGuestSession.credits,
        };
      } catch (error: unknown) {
        if (error instanceof AppError) {
          const message = mapServiceErrorToMessage(error);
          return { success: false, error: message };
        }

        logError(
          `Guest credit deduction error${
            operation ? ` for operation: ${operation}` : ""
          }`,
          error,
        );

        return {
          success: false,
          error: "Failed to update guest credits. Please try again.",
        };
      }
    }

    return {
      success: false,
      error: "Unable to determine session context. Please try again.",
    };
  } catch (error: unknown) {
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
