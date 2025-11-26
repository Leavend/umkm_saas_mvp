"use server";

import type { GeneratedImage } from "@prisma/client";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/lib/auth";
import { getValidGuestSession } from "~/server/auth/guest-session";
import { ValidationError } from "~/lib/errors";
import type { ApiResponse } from "~/lib/types";

type GalleryResponse = ApiResponse<{ images: GeneratedImage[] }>;
type SaveImageResponse = ApiResponse<{ image: GeneratedImage }>;

/**
 * Get gallery images for current user or guest
 */
export async function getGalleryImages(
    guestSessionId?: string,
): Promise<GalleryResponse> {
    try {
        const session = await getServerAuthSession();
        const userId = session?.user?.id;

        let images: GeneratedImage[];

        if (userId) {
            images = await db.generatedImage.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 50, // Limit to recent 50 images
            });
        } else if (guestSessionId) {
            const guestSession = await getValidGuestSession();
            if (!guestSession) {
                throw new ValidationError("Invalid guest session");
            }

            images = await db.generatedImage.findMany({
                where: { guestSessionId: guestSession.id },
                orderBy: { createdAt: "desc" },
                take: 50,
            });
        } else {
            throw new ValidationError(
                "User must be authenticated or provide guest session",
            );
        }

        return {
            success: true,
            data: { images },
            message: `Found ${images.length} generated images`,
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
            error: "Failed to fetch gallery images",
        };
    }
}

/**
 * Save a generated image to gallery
 */
export async function saveGeneratedImage(
    promptId: string,
    imageUrl: string,
    metadata?: Record<string, unknown>,
    guestSessionId?: string,
): Promise<SaveImageResponse> {
    try {
        if (!promptId?.trim() || !imageUrl?.trim()) {
            throw new ValidationError("Prompt ID and image URL are required");
        }

        const session = await getServerAuthSession();
        const userId = session?.user?.id;

        let image: GeneratedImage;

        if (userId) {
            image = await db.generatedImage.create({
                data: {
                    userId,
                    promptId,
                    imageUrl,
                    metadata: metadata ? (metadata as never) : undefined,
                },
            });
        } else if (guestSessionId) {
            const guestSession = await getValidGuestSession();
            if (!guestSession) {
                throw new ValidationError("Invalid guest session");
            }

            image = await db.generatedImage.create({
                data: {
                    guestSessionId: guestSession.id,
                    promptId,
                    imageUrl,
                    metadata: metadata ? (metadata as never) : undefined,
                },
            });
        } else {
            throw new ValidationError(
                "User must be authenticated or provide guest session",
            );
        }

        return {
            success: true,
            data: { image },
            message: "Image saved to gallery",
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
            error: "Failed to save image to gallery",
        };
    }
}
