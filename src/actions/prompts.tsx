"use server";

import type { Prompt } from "@prisma/client";
import { db } from "~/server/db";
import type { ApiResponse } from "~/lib/types";
import { getErrorMessage, NotFoundError } from "~/lib/errors";

// ===== RESPONSE TYPES =====

type PromptsListResponse = ApiResponse<{ prompts: Prompt[] }>;
type CopyPromptResponse = ApiResponse<{
  prompt: Prompt;
  remainingCredits: number;
}>;

// ===== PROMPT QUERIES =====

/**
 * Get all prompts ordered by creation date
 */
export async function getAllPrompts(): Promise<PromptsListResponse> {
  try {
    const prompts = await db.prompt.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: { prompts },
      message: `Found ${prompts.length} prompts`,
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Failed to fetch prompts:", errorMessage);

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
  if (!category?.trim()) {
    return {
      success: false,
      error: "Category is required",
    };
  }

  try {
    const prompts = await db.prompt.findMany({
      where: {
        category: category.trim(),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: { prompts },
      message: `Found ${prompts.length} prompts in category "${category}"`,
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Failed to fetch prompts by category:", errorMessage);

    return {
      success: false,
      error: "Failed to fetch prompts. Please try again.",
    };
  }
}

// ===== PROMPT ACTIONS =====

/**
 * Copy a prompt (simplified version without credit deduction)
 * TODO: Implement credit system when needed
 */
export async function copyPrompt(
  promptId: string,
): Promise<CopyPromptResponse> {
  if (!promptId?.trim()) {
    return {
      success: false,
      error: "Prompt ID is required",
    };
  }

  try {
    const prompt = await db.prompt.findUnique({
      where: { id: promptId.trim() },
    });

    if (!prompt) {
      throw new NotFoundError("Prompt not found");
    }

    // TODO: Implement credit deduction logic here
    // For now, return success without credit validation
    return {
      success: true,
      data: {
        prompt,
        remainingCredits: 999, // Placeholder value
      },
      message: "Prompt copied successfully",
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Failed to copy prompt:", errorMessage);

    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Prompt not found",
      };
    }

    return {
      success: false,
      error: "Failed to copy prompt. Please try again.",
    };
  }
}
