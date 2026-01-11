import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    ADMIN_EMAILS: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    STATUS_PAGE_URL: z.string().url().optional(),
    AWS_REGION: z.string().default("us-east-1").optional(),
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
