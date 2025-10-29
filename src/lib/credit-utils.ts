import { CREDITS_MAP } from "~/lib/constants";
import { db } from "~/server/db";

export async function applyCreditPurchase(userId: string, productId: string) {
  const creditsToAdd = CREDITS_MAP[productId as keyof typeof CREDITS_MAP] ?? 0;

  if (!creditsToAdd) {
    console.warn(
      "applyCreditPurchase called with unsupported productId",
      productId,
    );
    return;
  }

  await db.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: creditsToAdd,
      },
    },
  });
}
