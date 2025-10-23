// src/actions/users.tsx

"use server";

import { selectUserCredits } from "~/server/repositories/user-repository";
import { getCurrentUserId } from "~/server/auth/session";

export async function getUserCredits() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const user = await selectUserCredits(userId);

    return user?.credits ?? null;
  } catch (error) {
    console.error("Failed to load user credits", error);
    return null;
  }
}
