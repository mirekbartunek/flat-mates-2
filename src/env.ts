import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { vercel } from "@t3-oss/env-nextjs/presets";

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  server: {
    DATABASE_URL: z.string().url(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    UPLOADTHING_APP_ID: z.string(),
    RESEND_API_KEY: z.string(),
    MAPTILER_API_KEY: z.string(),
  },

  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },

  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",

  emptyStringAsUndefined: true,
});
