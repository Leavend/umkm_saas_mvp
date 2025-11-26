"use server";

import type { Prompt } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "~/lib/admin-auth";
import { ValidationError } from "~/lib/errors";
import type { ApiResponse } from "~/lib/types";

type AdminPromptResponse = ApiResponse<{ prompt: Prompt }>;
type AdminPromptsListResponse = ApiResponse<{ prompts: Prompt[] }>;
type AdminDeleteResponse = ApiResponse<{ id: string }>;

interface CreatePromptInput {
  title: string;
  text: string;
  imageUrl: string;
  category: string;
}

interface UpdatePromptInput extends Partial<CreatePromptInput> {
  id: string;
}

function validatePromptInput(input: CreatePromptInput): void {
  const errors: string[] = [];

  if (!input.title?.trim()) {
    errors.push("Title is required");
  }

  if (!input.text?.trim()) {
    errors.push("Prompt text is required");
  }

  if (!input.imageUrl?.trim()) {
    errors.push("Image URL is required");
  }

  if (!input.category?.trim()) {
    errors.push("Category is required");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }
}

export async function createPrompt(
  input: CreatePromptInput,
): Promise<AdminPromptResponse> {
  try {
    await requireAdmin();

    validatePromptInput(input);

    const prompt = await db.prompt.create({
      data: {
        title: input.title.trim(),
        text: input.text.trim(),
        imageUrl: input.imageUrl.trim(),
        category: input.category.trim(),
      },
    });

    revalidatePath("/");
    revalidatePath("/[lang]", "page");

    return {
      success: true,
      data: { prompt },
      message: "Prompt created successfully",
    };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create prompt. Please try again.",
    };
  }
}

export async function updatePrompt(
  input: UpdatePromptInput,
): Promise<AdminPromptResponse> {
  try {
    await requireAdmin();

    if (!input.id?.trim()) {
      throw new ValidationError("Prompt ID is required");
    }

    const updateData: Partial<CreatePromptInput> = {};

    if (input.title !== undefined) {
      if (!input.title.trim()) {
        throw new ValidationError("Title cannot be empty");
      }
      updateData.title = input.title.trim();
    }

    if (input.text !== undefined) {
      if (!input.text.trim()) {
        throw new ValidationError("Prompt text cannot be empty");
      }
      updateData.text = input.text.trim();
    }

    if (input.imageUrl !== undefined) {
      if (!input.imageUrl.trim()) {
        throw new ValidationError("Image URL cannot be empty");
      }
      updateData.imageUrl = input.imageUrl.trim();
    }

    if (input.category !== undefined) {
      if (!input.category.trim()) {
        throw new ValidationError("Category cannot be empty");
      }
      updateData.category = input.category.trim();
    }

    const prompt = await db.prompt.update({
      where: { id: input.id.trim() },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/[lang]", "page");

    return {
      success: true,
      data: { prompt },
      message: "Prompt updated successfully",
    };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update prompt. Please try again.",
    };
  }
}

export async function deletePrompt(id: string): Promise<AdminDeleteResponse> {
  try {
    await requireAdmin();

    if (!id?.trim()) {
      throw new ValidationError("Prompt ID is required");
    }

    await db.prompt.delete({
      where: { id: id.trim() },
    });

    revalidatePath("/");
    revalidatePath("/[lang]", "page");

    return {
      success: true,
      data: { id },
      message: "Prompt deleted successfully",
    };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to delete prompt. Please try again.",
    };
  }
}

export async function getAllPromptsAdmin(): Promise<AdminPromptsListResponse> {
  try {
    await requireAdmin();

    const prompts = await db.prompt.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: { prompts },
      message: `Found ${prompts.length} prompts`,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to fetch prompts. Please try again.",
    };
  }
}
