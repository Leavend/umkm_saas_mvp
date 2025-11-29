"use server";

import type { Prompt } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/lib/auth";
import {
  getGuestSessionId,
  getGuestSessionCredentials,
  GUEST_SESSION_COOKIE,
  GUEST_ACCESS_TOKEN_COOKIE,
  GUEST_SESSION_SECRET_COOKIE,
  GUEST_FINGERPRINT_COOKIE,
} from "~/server/auth/guest-session";
import {
  ensureGuestSession,
  GUEST_SESSION_MAX_AGE_SECONDS,
} from "~/server/services/guest-session-service";
import { ValidationError } from "~/lib/errors";
import type { ApiResponse } from "~/lib/types";
import { getServerTranslation, type Locale } from "~/lib/i18n";

type SavedPromptsResponse = ApiResponse<{ prompts: Prompt[] }>;
type SavePromptResponse = ApiResponse<{ saved: boolean }>;

/**
 * Get all saved prompts for current user or guest
 * Automatically detects user type from session
 */
export async function getSavedPrompts(
  locale: Locale = "en",
): Promise<SavedPromptsResponse> {
  try {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;

    let savedPrompts: Prompt[];

    if (userId) {
      // Authenticated user
      const results = await db.savedPrompt.findMany({
        where: { userId },
        include: { prompt: true },
        orderBy: { createdAt: "desc" },
      });
      savedPrompts = results.map((r) => r.prompt);
    } else {
      // Guest user - auto-detect from cookies
      try {
        const guestSession = await getGuestSessionId();
        if (guestSession) {
          const results = await db.savedPrompt.findMany({
            where: { guestSessionId: guestSession },
            include: { prompt: true },
            orderBy: { createdAt: "desc" },
          });
          savedPrompts = results.map((r) => r.prompt);
        } else {
          // No guest session, return empty
          savedPrompts = [];
        }
      } catch {
        // No valid guest session
        savedPrompts = [];
      }
    }

    return {
      success: true,
      data: { prompts: savedPrompts },
      message: `Found ${savedPrompts.length} saved prompts`,
    };
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getServerTranslation(
        locale,
        "common.errors.fetchSavedPromptsFailed",
      ),
    };
  }
}

/**
 * Save or unsave a prompt (toggle)
 * Automatically detects user type from session
 */
export async function toggleSavePrompt(
  promptId: string,
  locale: Locale = "en",
): Promise<SavePromptResponse> {
  try {
    if (!promptId?.trim()) {
      throw new ValidationError("Prompt ID is required");
    }

    const session = await getServerAuthSession();
    const userId = session?.user?.id;

    if (userId) {
      // Authenticated user
      const existing = await db.savedPrompt.findFirst({
        where: { userId, promptId },
      });

      if (existing) {
        // Unsave
        await db.savedPrompt.delete({
          where: { id: existing.id },
        });
        revalidatePath("/");
        return {
          success: true,
          data: { saved: false },
          message: "Prompt removed from saved",
        };
      } else {
        // Save
        await db.savedPrompt.create({
          data: { userId, promptId },
        });
        revalidatePath("/");
        return {
          success: true,
          data: { saved: true },
          message: "Prompt saved successfully",
        };
      }
    } else {
      // Guest user - auto-create session if needed
      try {
        let guestSessionId = await getGuestSessionId();

        // If no session exists, create one automatically
        if (!guestSessionId) {
          const credentials = await getGuestSessionCredentials();
          const { session, created } = await ensureGuestSession(credentials);

          // Set cookies for the new session
          if (created) {
            const cookieStore = await cookies();
            const cookieOptions = {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax" as const,
              maxAge: GUEST_SESSION_MAX_AGE_SECONDS,
              path: "/",
            };

            cookieStore.set(GUEST_SESSION_COOKIE, session.id, cookieOptions);
            cookieStore.set(
              GUEST_ACCESS_TOKEN_COOKIE,
              session.accessToken,
              cookieOptions,
            );
            cookieStore.set(
              GUEST_SESSION_SECRET_COOKIE,
              session.sessionSecret,
              cookieOptions,
            );
            cookieStore.set(
              GUEST_FINGERPRINT_COOKIE,
              session.fingerprint,
              cookieOptions,
            );
          }

          guestSessionId = session.id;
        }

        const existing = await db.savedPrompt.findFirst({
          where: {
            guestSessionId,
            promptId,
          },
        });

        if (existing) {
          await db.savedPrompt.delete({
            where: { id: existing.id },
          });
          revalidatePath("/");
          return {
            success: true,
            data: { saved: false },
            message: "Prompt removed from saved",
          };
        } else {
          await db.savedPrompt.create({
            data: { guestSessionId, promptId },
          });
          revalidatePath("/");
          return {
            success: true,
            data: { saved: true },
            message: "Prompt saved successfully",
          };
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        console.error("Guest session error:", error);
        throw new ValidationError("Failed to save prompt. Please try again.");
      }
    }
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getServerTranslation(locale, "common.errors.toggleSavedFailed"),
    };
  }
}

/**
 * Check if a prompt is saved by current user/guest
 * Automatically detects user type from session
 */
export async function isPromptSaved(
  promptId: string,
  locale: Locale = "en",
): Promise<ApiResponse<{ saved: boolean }>> {
  try {
    if (!promptId?.trim()) {
      throw new ValidationError("Prompt ID is required");
    }

    const session = await getServerAuthSession();
    const userId = session?.user?.id;

    let saved = false;

    if (userId) {
      const existing = await db.savedPrompt.findFirst({
        where: { userId, promptId },
      });
      saved = !!existing;
    } else {
      // Guest user - auto-detect from cookies
      try {
        const guestSessionId = await getGuestSessionId();
        if (guestSessionId) {
          const existing = await db.savedPrompt.findFirst({
            where: {
              guestSessionId,
              promptId,
            },
          });
          saved = !!existing;
        }
      } catch {
        // No valid guest session, not saved
        saved = false;
      }
    }

    return {
      success: true,
      data: { saved },
    };
  } catch {
    return {
      success: false,
      error: getServerTranslation(
        locale,
        "common.errors.checkSavedStatusFailed",
      ),
    };
  }
}
