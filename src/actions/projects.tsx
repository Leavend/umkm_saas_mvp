// src/actions/projects.tsx

"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { db } from "~/server/db";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, TRANSLATIONS } from "~/lib/i18n";

interface CreateProjectData {
  imageUrl: string;
  imageKitId: string;
  filePath: string;
  name?: string;
}

export async function createProject(data: CreateProjectData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Ambil nama default dari terjemahan
    // Pastikan DEFAULT_LOCALE adalah 'en' atau 'id' yang valid
    const defaultProjectName =
      TRANSLATIONS[DEFAULT_LOCALE]?.projects?.card?.untitled ??
      "Untitled Project";

    const project = await db.project.create({
      data: {
        name: data.name ?? defaultProjectName, // Gunakan nama default yang sudah diambil
        imageUrl: data.imageUrl,
        imageKitId: data.imageKitId,
        filePath: data.filePath,
        userId: session.user.id,
      },
    });

    return { success: true, project };
  } catch (error) {
    console.error("Project creation error:", error);
    // Berikan pesan error yang lebih generik ke client
    return {
      success: false,
      error: "Failed to create project. Please try again.",
    };
  }
}

export async function getUserProjects() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Handle kasus session tidak ada dengan lebih baik
    if (!session?.user?.id) {
      // Bisa return array kosong atau error spesifik
      console.warn("getUserProjects called without active session.");
      return { success: true, projects: [] }; // Kembalikan array kosong
      // throw new Error("Unauthorized"); // Atau lempar error jika user harus selalu login
    }

    const projects = await db.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc", // Index pada [userId, createdAt] akan membantu ini
      },
      // Pertimbangkan pagination jika jumlah project bisa sangat banyak
      // take: 50, // Contoh: Ambil 50 project terbaru
    });

    return { success: true, projects };
  } catch (error) {
    console.error("Projects fetch error:", error);
    // Berikan pesan error yang lebih generik ke client
    return {
      success: false,
      error: "Failed to fetch projects. Please try again.",
    };
  }
}

export async function deductCredits(
  creditsToDeduct: number,
  operation?: string,
) {
  try {
    if (
      !creditsToDeduct ||
      typeof creditsToDeduct !== "number" ||
      creditsToDeduct <= 0 ||
      !Number.isInteger(creditsToDeduct)
    ) {
      console.error(`Invalid credit amount received: ${creditsToDeduct}`);
      return { success: false, error: "Invalid credit amount specified." };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      console.warn("deductCredits called without active session.");
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      if (!user) {
        throw new Error("User not found during transaction.");
      }

      if (user.credits < creditsToDeduct) {
        return { success: false, error: "Insufficient credits." };
      }

      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: creditsToDeduct,
          },
        },
        select: { credits: true },
      });

      return { success: true, remainingCredits: updatedUser.credits };
    });

    return result;
  } catch (error: unknown) {
    console.error(
      `Credit deduction error${operation ? ` for operation: ${operation}` : ""}:`,
      error,
    );

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "User not found during credit update." };
    }

    if (
      error instanceof Error &&
      error.message === "User not found during transaction."
    ) {
      return { success: false, error: "User not found during credit update." };
    }

    return {
      success: false,
      error:
        "An unexpected error occurred while deducting credits. Please try again.",
    };
  }
}
