import { NextResponse } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { logError } from "~/lib/errors";

type XenditInvoiceMetadata = {
  productId?: string;
  userId?: string;
  [key: string]: unknown;
};

type XenditInvoiceItem = {
  reference_id?: string;
};

type XenditWebhookPayload = {
  event?: string;
  data?: {
    external_id?: string;
    externalId?: string;
    status?: string;
    metadata?: XenditInvoiceMetadata;
    items?: XenditInvoiceItem[];
  };
};

/**
 * Apply credit purchase to user after successful payment
 */
async function applyCreditPurchase(externalId: string, productId: string) {
  // Parse user ID from external ID (format: "userId-timestamp")
  const userId = externalId.split("-")[0];

  if (!userId) {
    throw new Error("Invalid external ID format - cannot extract user ID");
  }

  // Get product configuration
  const product = Object.values(PRODUCT_CONFIG).find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  // Update user credits atomically
  const updated = await db.user.update({
    where: { id: userId },
    data: {
      credits: { increment: product.credits },
    },
    select: { credits: true },
  });

  return updated;
}

export async function POST(request: Request) {
  try {
    const callbackToken = request.headers.get("x-callback-token");

    if (!callbackToken || callbackToken !== env.XENDIT_CALLBACK_TOKEN) {
      return NextResponse.json(
        { error: "Invalid callback token" },
        { status: 401 },
      );
    }

    const payload = (await request
      .json()
      .catch(() => null)) as XenditWebhookPayload | null;

    if (!payload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Only process paid invoices
    if (payload.event !== "invoice.paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Extract identifiers with fallback logic
    const externalId = payload.data?.external_id ?? payload.data?.externalId;
    const productId =
      payload.data?.metadata?.productId ??
      payload.data?.items?.find((item) => item.reference_id)?.reference_id;

    if (!externalId || !productId) {
      logError("Xendit webhook: Missing identifiers", {
        externalId,
        productId,
        payload,
      });
      return NextResponse.json(
        { error: "Missing identifiers" },
        { status: 400 },
      );
    }

    // Only process PAID status
    if (payload.data?.status !== "PAID") {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    // Apply credits to user
    await applyCreditPurchase(externalId, productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Xendit webhook processing error", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
