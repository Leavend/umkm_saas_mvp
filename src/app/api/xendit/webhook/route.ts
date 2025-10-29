import { NextResponse } from "next/server";

import { applyCreditPurchase } from "~/lib/credit-utils";
import { env } from "~/env";

type XenditInvoiceMetadata = {
  productId?: string;
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

    if (payload.event !== "invoice.paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const externalId = payload.data?.external_id ?? payload.data?.externalId;
    const productId =
      payload.data?.metadata?.productId ??
      payload.data?.items?.find((item) => item.reference_id)?.reference_id;

    if (!externalId || !productId) {
      console.error(
        "Missing externalId or productId in webhook payload",
        payload,
      );
      return NextResponse.json(
        { error: "Missing identifiers" },
        { status: 400 },
      );
    }

    if (payload.data?.status !== "PAID") {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    await applyCreditPurchase(externalId, productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Xendit webhook processing error", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
