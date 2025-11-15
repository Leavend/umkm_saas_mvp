/**
 * Prompt service with credit system integration
 * Handles prompt operations with credit validation and deduction
 */

import { Prisma, type Prompt } from "@prisma/client";
import { db } from "~/server/db";
import {
  InsufficientCreditsError,
  NotFoundError,
  ValidationError,
} from "~/lib/errors";

// Credit cost per prompt copy
const PROMPT_COPY_COST = 1;

interface PromptCopyResult {
  prompt: Prompt;
  remainingCredits: number;
  creditDeducted: number;
}

interface UserCredits {
  credits: number;
}

/**
 * Deduct credits from user for prompt copy
 * Uses transaction for atomicity
 */
export async function deductCreditsFromUser(
  userId: string,
  amount: number = PROMPT_COPY_COST,
): Promise<{ credits: number }> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ValidationError("Credit amount must be a positive integer");
  }

  const updated = await db.$transaction<UserCredits>(async (tx) => {
    // Fetch current balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check sufficient balance
    if (user.credits < amount) {
      throw new InsufficientCreditsError();
    }

    // Atomically deduct credits
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: amount },
      },
      select: { credits: true },
    });

    return updated;
  });

  return updated;
}

/**
 * Deduct credits from guest session for prompt copy
 * Uses transaction for atomicity
 */
export async function deductCreditsFromGuest(
  guestSessionId: string,
  amount: number = PROMPT_COPY_COST,
): Promise<{ credits: number }> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ValidationError("Credit amount must be a positive integer");
  }

  const now = new Date();

  const updated = await db.$transaction<UserCredits>(async (tx) => {
    // Fetch current balance and verify session is active
    const session = await tx.guestSession.findFirst({
      where: {
        id: guestSessionId,
        expiresAt: { gt: now },
      },
      select: { credits: true },
    });

    if (!session) {
      throw new NotFoundError("Guest session not found or expired");
    }

    // Check sufficient balance
    if (session.credits < amount) {
      throw new InsufficientCreditsError();
    }

    // Atomically deduct credits
    const updated = await tx.guestSession.update({
      where: { id: guestSessionId },
      data: {
        credits: { decrement: amount },
        updatedAt: now,
      },
      select: { credits: true },
    });

    return updated;
  });

  return updated;
}

/**
 * Get single prompt by ID with existence check
 */
export async function getPromptById(promptId: string): Promise<Prompt> {
  if (!promptId?.trim()) {
    throw new ValidationError("Prompt ID is required");
  }

  const prompt = await db.prompt.findUnique({
    where: { id: promptId.trim() },
  });

  if (!prompt) {
    throw new NotFoundError("Prompt not found");
  }

  return prompt;
}

/**
 * Get all prompts ordered by creation date
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  return db.prompt.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get prompts by category
 */
export async function getPromptsByCategory(category: string): Promise<Prompt[]> {
  if (!category?.trim()) {
    throw new ValidationError("Category is required");
  }

  return db.prompt.findMany({
    where: { category: category.trim() },
    orderBy: { createdAt: "desc" },
  });
}
