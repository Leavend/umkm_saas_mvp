import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oneTap } from "better-auth/plugins";
import { env } from "~/env";
import { AUTH_CONFIG } from "~/lib/auth-config";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Tambahkan social providers
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      ...AUTH_CONFIG.google,
    },
  },
  plugins: [
    oneTap({
      // Server-side configuration untuk One Tap
      disableSignup: false,
      // Pastikan clientId sama dengan yang digunakan di client
      clientId: env.GOOGLE_CLIENT_ID,
    }),
  ],
  // Tambahkan CORS configuration untuk development
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "https://*.ngrok-free.app"]
        : [env.BETTER_AUTH_URL],
    credentials: true,
  },
});
