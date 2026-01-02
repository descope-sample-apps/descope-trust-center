import { createEnv } from "@t3-oss/env-nextjs";
import { neonVercel, vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    DATABASE_URL: z.url().optional(),
    POSTGRES_URL: z.url(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    RESEND_API_KEY: z.string().min(1),
    AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(90),
    TRUST_CENTER_FROM_EMAIL: z
      .string()
      .email()
      .default("Trust Center <noreply@descope.com>"),
    TRUST_CENTER_NOTIFICATION_EMAIL: z
      .string()
      .email()
      .default("security@descope.com"),
  },

  client: {
    NEXT_PUBLIC_DESCOPE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_GA_ID: z.string().min(1),
    NEXT_PUBLIC_STATUS_PAGE_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_DESCOPE_PROJECT_ID: process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_STATUS_PAGE_URL: process.env.NEXT_PUBLIC_STATUS_PAGE_URL,
  },
  skipValidation:
    !!process.env.CI ||
    process.env.npm_lifecycle_event === "lint" ||
    !process.env.DATABASE_URL,
});
