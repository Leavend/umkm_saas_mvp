import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "~/env";
import { AUTH_CONFIG } from "~/lib/auth-config";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      ...AUTH_CONFIG.google,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  cookies: {
    domain: process.env.NODE_ENV === "development" ? "localhost" : undefined,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  plugins: [],
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "https://*.ngrok-free.app"]
        : [env.BETTER_AUTH_URL],
    credentials: true,
  },
});
