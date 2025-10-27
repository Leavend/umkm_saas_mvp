// src/actions/users.tsx

"use server";

import { getCurrentUserId } from "~/server/auth/session";
import { ensureDailyCreditForUser } from "~/server/services/user-service";

export async function getUserCredits() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const { credits } = await ensureDailyCreditForUser(userId);

    return credits;
  } catch (error) {
    console.error("Failed to load user credits", error);
    return null;
  }
}
