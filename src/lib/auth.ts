import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { db } from "~/server/db";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "b1683342-0ae2-472d-938c-0dbb305da157",
              slug: "small",
            },
            {
              productId: "4c253826-afe9-40d1-918e-28aef0447f27",
              slug: "medium",
            },
            {
              productId: "3d8c0664-2fa3-4f82-a8d8-e9e56158aa22",
              slug: "large",
            },
          ],
          successUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (order) => {
            const externalCustomerId = order.data.customer.externalId;

            if (!externalCustomerId) {
              console.error("No external customer ID found.");
              throw new Error("No external customer id found.");
            }

            const productId = order.data.productId;

            let creditsToAdd = 0;

            switch (productId) {
              case "b1683342-0ae2-472d-938c-0dbb305da157":
                creditsToAdd = 10;
                break;
              case "4c253826-afe9-40d1-918e-28aef0447f27":
                creditsToAdd = 30;
                break;
              case "3d8c0664-2fa3-4f82-a8d8-e9e56158aa22":
                creditsToAdd = 100;
                break;
            }

            await db.user.update({
              where: { id: externalCustomerId },
              data: {
                credits: {
                  increment: creditsToAdd,
                },
              },
            });
          },
        }),
      ],
    }),
  ],
});
