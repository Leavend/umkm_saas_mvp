// Server actions for prompt request feature
"use server";

import { db } from "~/server/db";
import { getSessionContext } from "~/server/auth/unified-session";
import { logger } from "~/lib/logger";
import { captureError } from "~/lib/sentry";

interface SavePromptRequestInput {
  description: string;
  category?: string;
}

// Helper: Get client IP from headers
// Note: Simplified for production - IP tracking is optional
function getClientIp(): string | null {
  return null; // Can be enhanced later with proper middleware
}

/**
 * Submit a new prompt request
 */
export async function savePromptRequest(input: SavePromptRequestInput) {
  try {
    const context = await getSessionContext();
    const ipAddress = getClientIp();

    const data = {
      description: input.description.trim(),
      category: input.category || null,
      userId: context.userId || null,
      guestSessionId: context.type === "guest" ? context.guestSession.id : null,
      ipAddress,
    };

    const request = await db.promptRequest.create({ data });

    logger.info({
      msg: "Prompt request submitted",
      requestId: request.id,
      userId: context.userId,
      category: input.category,
    });

    return { success: true, data: { requestId: request.id } };
  } catch (error) {
    logger.error({ msg: "savePromptRequest failed", err: error });
    captureError(error, { tags: { action: "savePromptRequest" } });
    return { success: false, error: "Failed to submit request" };
  }
}

/**
 * Get all prompt requests (Admin only)
 */
export async function getPromptRequests() {
  try {
    const context = await getSessionContext();

    // Check if user is admin
    if (!context.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const requests = await db.promptRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return { success: true, data: { requests } };
  } catch (error) {
    logger.error({ msg: "getPromptRequests failed", err: error });
    captureError(error, { tags: { action: "getPromptRequests" } });
    return { success: false, error: "Failed to fetch requests" };
  }
}

/**
 * Update prompt request status (Admin only)
 */
export async function updateRequestStatus(
  requestId: string,
  status: "pending" | "reviewed" | "fulfilled",
) {
  try {
    const context = await getSessionContext();

    if (!context.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.promptRequest.update({
      where: { id: requestId },
      data: { status },
    });

    logger.info({ msg: "Request status updated", requestId, status });

    return { success: true };
  } catch (error) {
    logger.error({ msg: "updateRequestStatus failed", err: error });
    captureError(error, { tags: { action: "updateRequestStatus" } });
    return { success: false, error: "Failed to update status" };
  }
}
