// src/actions/prompts.tsx

"use server";

import type { Prompt } from "@prisma/client";
import { db } from "~/server/db";
import { deductCredits } from "./projects";

type ActionError = {
  success: false;
  error: string | { code: string; message: string };
};

type PromptsListSuccess = {
  success: true;
  prompts: Prompt[];
};

type CopyPromptSuccess = {
  success: true;
  prompt: Prompt;
  remainingCredits: number;
};

export async function getAllPrompts(): Promise<
  PromptsListSuccess | ActionError
> {
  try {
    const prompts = await db.prompt.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, prompts };
  } catch (error: unknown) {
    console.error("Prompts fetch error:", error);
    return {
      success: false,
      error: "Failed to fetch prompts. Please try again.",
    };
  }
}

export async function getPromptsByCategory(
  category: string,
): Promise<PromptsListSuccess | ActionError> {
  try {
    const prompts = await db.prompt.findMany({
      where: {
        category,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, prompts };
  } catch (error: unknown) {
    console.error("Prompts fetch error:", error);
    return {
      success: false,
      error: "Failed to fetch prompts. Please try again.",
    };
  }
}

export async function copyPrompt(
  promptId: string,
): Promise<CopyPromptSuccess | ActionError> {
  try {
    // First, deduct 1 credit
    const creditResult = await deductCredits(1, "copy-prompt");

    if (!creditResult.success) {
      return {
        success: false,
        error: creditResult.error,
      };
    }

    // Fetch the prompt
    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return {
        success: false,
        error: "Prompt not found.",
      };
    }

    return {
      success: true,
      prompt,
      remainingCredits: creditResult.remainingCredits,
    };
  } catch (error: unknown) {
    console.error("Copy prompt error:", error);
    if (error instanceof Error && error.message.includes("Not enough credits")) {
      return {
        success: false,
        error: {
          code: "INSUFFICIENT_CREDITS",
          message: "You do not have enough credits to perform this action.",
        },
      };
    }
    return {
      success: false,
      error: "Failed to copy prompt. Please try again.",
    };
  }
}
