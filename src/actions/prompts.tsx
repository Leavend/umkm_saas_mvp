"use server";

import type { ApiResponse } from "~/lib/types";
import {
  InsufficientCreditsError,
  NotFoundError,
  ValidationError,
} from "~/lib/errors";
import { auth } from "~/lib/auth";
import {
  getAllPrompts as getAllPromptsService,
  getPromptsByCategory as getPromptsByCategoryService,
  getPromptById,
  deductCreditsFromUser,
  deductCreditsFromGuest,
} from "~/server/services/prompt-service";
import type { Prompt } from "@prisma/client";

// ===== RESPONSE TYPES =====

type PromptsListResponse = ApiResponse<{ prompts: Prompt[] }>;
type CopyPromptResponse = ApiResponse<{
  prompt: Prompt;
  remainingCredits: number;
  creditDeducted: number;
}>;

// ===== PROMPT QUERIES =====

/**
 * Get all prompts ordered by creation date
 */
export async function getAllPrompts(): Promise<PromptsListResponse> {
  try {
    const prompts = await getAllPromptsService();

    return {
      success: true,
      data: { prompts },
      message: `Found ${prompts.length} prompts`,
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch prompts. Please try again.",
    };
  }
}

/**
 * Get prompts filtered by category
 */
export async function getPromptsByCategory(
  category: string,
): Promise<PromptsListResponse> {
  try {
    const prompts = await getPromptsByCategoryService(category);

    return {
      success: true,
      data: { prompts },
      message: `Found ${prompts.length} prompts in category "${category}"`,
    };
  } catch (_error: unknown) {
    if (_error instanceof ValidationError) {
      return {
        success: false,
        error: _error.message,
      };
    }

    return {
      success: false,
      error: "Failed to fetch prompts. Please try again.",
    };
  }
}

// ===== PROMPT ACTIONS =====

/**
 * Copy a prompt with automatic credit deduction
 * Supports both authenticated users and guest sessions
 *
 * @param promptId - ID of prompt to copy
 * @param guestSessionId - Optional guest session ID (for unauthenticated users)
 * @returns Prompt data with remaining credits after deduction
 */
export async function copyPrompt(
  promptId: string,
  guestSessionId?: string,
): Promise<CopyPromptResponse> {
  try {
    // Validate input
    if (!promptId?.trim()) {
      throw new ValidationError("Prompt ID is required");
    }

    // Get prompt
    const prompt = await getPromptById(promptId);

    // Get authenticated session using NextAuth
    const session = await auth();

    // Determine credit deduction based on auth status
    let remainingCredits: number;
    const creditDeducted = 1;

    const userId = session?.user?.id;
    if (userId) {
      // Authenticated user: deduct from user credits
      const result = await deductCreditsFromUser(userId, creditDeducted);
      remainingCredits = result.credits;
    } else if (guestSessionId?.trim()) {
      // Guest user: deduct from guest session credits
      const result = await deductCreditsFromGuest(
        guestSessionId.trim(),
        creditDeducted,
      );
      remainingCredits = result.credits;
    } else {
      throw new ValidationError(
        "User must be authenticated or provide guest session ID",
      );
    }

    return {
      success: true,
      data: {
        prompt,
        remainingCredits,
        creditDeducted,
      },
      message: "Prompt copied successfully",
    };
  } catch (_error: unknown) {
    // Handle specific error types with appropriate messages
    if (_error instanceof InsufficientCreditsError) {
      return {
        success: false,
        error: "Insufficient credits. Please purchase more credits.",
      };
    }

    if (_error instanceof NotFoundError) {
      return {
        success: false,
        error: _error.message,
      };
    }

    if (_error instanceof ValidationError) {
      return {
        success: false,
        error: _error.message,
      };
    }

    return {
      success: false,
      error: "Failed to copy prompt. Please try again.",
    };
  }
}
