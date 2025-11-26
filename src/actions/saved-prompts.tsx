"use server";

import type { Prompt } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/lib/auth";
import { getValidGuestSession } from "~/server/auth/guest-session";
import { ValidationError } from "~/lib/errors";
import type { ApiResponse } from "~/lib/types";

type SavedPromptsResponse = ApiResponse<{ prompts: Prompt[] }>;
type SavePromptResponse = ApiResponse<{ saved: boolean }>;

/**
 * Get all saved prompts for current user or guest
 */
export async function getSavedPrompts(
    guestSessionId?: string,
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
        } else if (guestSessionId) {
            // Guest user
            const guestSession = await getValidGuestSession();
            if (!guestSession) {
                throw new ValidationError("Invalid guest session");
            }

            const results = await db.savedPrompt.findMany({
                where: { guestSessionId: guestSession.id },
                include: { prompt: true },
                orderBy: { createdAt: "desc" },
            });
            savedPrompts = results.map((r) => r.prompt);
        } else {
            throw new ValidationError(
                "User must be authenticated or provide guest session",
            );
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
            error: "Failed to fetch saved prompts",
        };
    }
}

/**
 * Save or unsave a prompt (toggle)
 */
export async function toggleSavePrompt(
    promptId: string,
    guestSessionId?: string,
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
        } else if (guestSessionId) {
            // Guest user
            const guestSession = await getValidGuestSession();
            if (!guestSession) {
                throw new ValidationError("Invalid guest session");
            }

            const existing = await db.savedPrompt.findFirst({
                where: {
                    guestSessionId: guestSession.id,
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
                    data: { guestSessionId: guestSession.id, promptId },
                });
                revalidatePath("/");
                return {
                    success: true,
                    data: { saved: true },
                    message: "Prompt saved successfully",
                };
            }
        } else {
            throw new ValidationError(
                "User must be authenticated or provide guest session",
            );
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
            error: "Failed to toggle saved prompt",
        };
    }
}

/**
 * Check if a prompt is saved by current user/guest
 */
export async function isPromptSaved(
    promptId: string,
    guestSessionId?: string,
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
        } else if (guestSessionId) {
            const guestSession = await getValidGuestSession();
            if (guestSession) {
                const existing = await db.savedPrompt.findFirst({
                    where: {
                        guestSessionId: guestSession.id,
                        promptId,
                    },
                });
                saved = !!existing;
            }
        }

        return {
            success: true,
            data: { saved },
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: "Failed to check saved status",
        };
    }
}
