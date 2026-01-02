import { createEnv } from "@t3-oss/env-nextjs";
import { neonVercel, vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  extends: [vercel(), neonVercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    POSTGRES_URL: z.url(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    RESEND_API_KEY: z.string().min(1),
    AUDIT_LOG_RETENTION_DAYS: z.number().min(1).max(3650).default(90),
  },

  client: {
    NEXT_PUBLIC_DESCOPE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_GA_ID: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_DESCOPE_PROJECT_ID: process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
