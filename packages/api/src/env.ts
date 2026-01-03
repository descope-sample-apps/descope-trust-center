import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

// In test environment, make email-related env vars optional
const isTest = process.env.NODE_ENV === "test";

export const env = createEnv({
  server: {
    ADMIN_EMAILS: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    STATUS_PAGE_URL: z.string().url().optional(),
    RESEND_API_KEY: z.string().optional(),
    TRUST_CENTER_FROM_EMAIL: z
      .string()
      .email()
      .default("Trust Center <noreply@descope.com>")
      .optional(),
    TRUST_CENTER_NOTIFICATION_EMAIL: z
      .string()
      .email()
      .default("security@descope.com")
      .optional(),
    AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(90),
  },
  runtimeEnv: process.env,
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
