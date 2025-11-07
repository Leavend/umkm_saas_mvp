import { PRODUCT_UTILS } from "~/lib/constants";
import { db } from "~/server/db";

export async function applyCreditPurchase(userId: string, productId: string) {
  const creditsToAdd = PRODUCT_UTILS.getCreditsById(productId);

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
