import { NextResponse } from "next/server";
import { XenditSdkError } from "xendit-node";

import {
  PRODUCT_AMOUNTS,
  PRODUCT_AMOUNTS_USD,
  PRODUCT_NAMES,
} from "~/lib/constants";
import { env } from "~/env";
import { xenditInvoiceClient } from "~/lib/xendit";
import { UnauthorizedError } from "~/lib/errors";
import { requireCurrentUserId } from "~/server/auth/session";

type CreateInvoicePayload = {
  productId?: string;
  currency?: string;
};

export async function POST(request: Request) {
  try {
    const userId = await requireCurrentUserId();
    const body = (await request
      .json()
      .catch(() => null)) as CreateInvoicePayload | null;

    const productId = body?.productId;
    const currency = body?.currency ?? "IDR";

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid productId" },
        { status: 400 },
      );
    }

    if (!["IDR", "USD"].includes(currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const amount =
      currency === "USD"
        ? PRODUCT_AMOUNTS_USD[productId as keyof typeof PRODUCT_AMOUNTS_USD]
        : PRODUCT_AMOUNTS[productId as keyof typeof PRODUCT_AMOUNTS];

    if (!amount) {
      return NextResponse.json({ error: "Unknown productId" }, { status: 400 });
    }

    const productName =
      PRODUCT_NAMES[productId as keyof typeof PRODUCT_NAMES] ?? "Credit Top-up";

    const origin = request.headers.get("origin") ?? env.BETTER_AUTH_URL;

    const successUrl = new URL("/dashboard", origin).toString();

    const externalId = `${userId}-${productId}-${Date.now()}`;

    const invoice = await xenditInvoiceClient.createInvoice({
      data: {
        externalId,
        amount,
        currency,
        description: productName,
        items: [
          {
            name: productName,
            price: amount,
            quantity: 1,
            referenceId: productId,
          },
        ],
        metadata: {
          userId,
          productId,
          currency,
          externalId,
        },
        successRedirectUrl: successUrl,
        failureRedirectUrl: successUrl,
      },
    });

    return NextResponse.json({ invoiceUrl: invoice.invoiceUrl });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof XenditSdkError) {
      console.error("Xendit create invoice API error", {
        status: error.status,
        code: error.errorCode,
        message: error.errorMessage,
      });

      const status =
        typeof error.status === "number" && Number.isFinite(error.status)
          ? error.status
          : 502;

      return NextResponse.json(
        { error: error.errorMessage ?? "Failed to create invoice" },
        { status },
      );
    }

    console.error("Xendit create invoice error", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
