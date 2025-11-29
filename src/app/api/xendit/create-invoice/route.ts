import { NextResponse } from "next/server";
import { XenditSdkError } from "xendit-node";

import { PRODUCT_UTILS } from "~/lib/constants";
import { env } from "~/env";
import { xenditInvoiceClient } from "~/lib/xendit";
import { UnauthorizedError } from "~/lib/errors";
import { requireCurrentUserId } from "~/server/auth/session";
import { withSentryTracing, captureError } from "~/lib/sentry";
import { log } from "~/lib/logger";

type CreateInvoicePayload = {
  productId?: string;
  currency?: string;
};

export async function POST(request: Request) {
  let body: CreateInvoicePayload | null = null;

  return await withSentryTracing(
    "xendit.createInvoice",
    async () => {
      try {
        const userId = await requireCurrentUserId();
        body = (await request
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
          return NextResponse.json(
            { error: "Invalid currency" },
            { status: 400 },
          );
        }

        // Get product configuration by ID
        const product = PRODUCT_UTILS.getById(productId);

        if (!product) {
          return NextResponse.json(
            { error: "Unknown productId" },
            { status: 400 },
          );
        }

        const amount = currency === "USD" ? product.usdAmount : product.amount;
        const productName = product.name;

        const origin = request.headers.get("origin") ?? env.NEXTAUTH_URL ?? "";

        const successUrl = new URL("/", origin).toString();

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
      } catch (error: unknown) {
        // Capture error in Sentry with context
        captureError(error, {
          tags: {
            flow: "payment",
            operation: "create_invoice",
          },
          extra: {
            productId: body?.productId,
            currency: body?.currency,
          },
        });

        if (error instanceof UnauthorizedError) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof XenditSdkError) {
          log.error("Xendit create invoice API error", error, {
            status: error.status,
            code: error.errorCode,
            message: error.errorMessage,
            userId: await requireCurrentUserId().catch(() => "unknown"),
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

        log.error("Xendit create invoice error", error as Error, {
          userId: await requireCurrentUserId().catch(() => "unknown"),
        });
        return NextResponse.json(
          { error: "Failed to create invoice" },
          { status: 500 },
        );
      }
    },
    { userId: await requireCurrentUserId().catch(() => "unknown") },
  );
}
