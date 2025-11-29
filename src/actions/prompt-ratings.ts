// Server actions for prompt ratings
"use server";

import { db } from "~/server/db";
import { getSessionContext } from "~/server/auth/unified-session";
import { logger } from "~/lib/logger";
import { captureError } from "~/lib/sentry";

interface RatePromptInput {
  promptId: string;
  rating: boolean; // true = thumbs up, false = thumbs down
}

// Submit rating
export async function ratePrompt(input: RatePromptInput) {
  try {
    const context = await getSessionContext();
    const { promptId, rating } = input;

    // Validate prompt exists
    const prompt = await db.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) {
      return { success: false, error: "Prompt not found" };
    }

    // Check if already rated
    const existing = await db.promptRating.findFirst({
      where: {
        promptId,
        ...(context.userId
          ? { userId: context.userId }
          : { guestSessionId: context.guestSession?.id }),
      },
    });

    if (existing) {
      return { success: false, error: "Already rated" };
    }

    // Create rating
    await db.promptRating.create({
      data: {
        promptId,
        rating,
        userId: context.userId || null,
        guestSessionId:
          context.type === "guest" ? context.guestSession!.id : null,
      },
    });

    logger.info({
      msg: "Prompt rated",
      promptId,
      rating: rating ? "thumbs_up" : "thumbs_down",
      userId: context.userId,
    });

    // Track analytics event
    if (typeof window !== "undefined") {
      const { trackEvent } = await import("~/lib/analytics");
      trackEvent("prompt_rated", {
        promptId,
        rating: rating ? "thumbs_up" : "thumbs_down",
        isAuthenticated: !!context.userId,
      });
    }

    return { success: true };
  } catch (error) {
    logger.error({ msg: "ratePrompt failed", err: error });
    captureError(error, { tags: { action: "ratePrompt" } });
    return { success: false, error: "Failed to submit rating" };
  }
}

// Get ratings statistics
export async function getPromptStats(promptId: string) {
  try {
    const ratings = await db.promptRating.findMany({
      where: { promptId },
      select: { rating: true },
    });

    const total = ratings.length;
    const thumbsUp = ratings.filter(
      (r: { rating: boolean }) => r.rating,
    ).length;
    const thumbsDown = total - thumbsUp;
    const score = total > 0 ? Math.round((thumbsUp / total) * 100) : null;

    return {
      success: true,
      data: { total, thumbsUp, thumbsDown, score },
    };
  } catch (error) {
    logger.error({ msg: "getPromptStats failed", err: error });
    return { success: false, error: "Failed to get stats" };
  }
}

// Check if user already rated
export async function hasUserRated(promptId: string) {
  try {
    const context = await getSessionContext();

    const rating = await db.promptRating.findFirst({
      where: {
        promptId,
        ...(context.userId
          ? { userId: context.userId }
          : { guestSessionId: context.guestSession?.id }),
      },
    });

    return { success: true, data: { hasRated: !!rating } };
  } catch (error) {
    logger.error({ msg: "hasUserRated failed", err: error });
    return { success: false, error: "Failed to check rating" };
  }
}
