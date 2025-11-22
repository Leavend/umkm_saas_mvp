import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url().optional(),
    XENDIT_SECRET_KEY: z.string(),
    XENDIT_CALLBACK_TOKEN: z.string(),
    IMAGEKIT_PRIVATE_KEY: z.string(),
    IMAGEKIT_URL_ENDPOINT: z.string().url(),
    IMAGEKIT_PUBLIC_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url(),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
    NEXT_PUBLIC_GOOGLE_ONE_TAP_ALLOWED_ORIGINS: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY,
    XENDIT_CALLBACK_TOKEN: process.env.XENDIT_CALLBACK_TOKEN,
    IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_ONE_TAP_ALLOWED_ORIGINS:
      process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP_ALLOWED_ORIGINS,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
