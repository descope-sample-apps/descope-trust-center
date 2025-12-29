import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function authEnv() {
  return createEnv({
    server: {},
    clientPrefix: "NEXT_PUBLIC_",
    client: {
      NEXT_PUBLIC_DESCOPE_PROJECT_ID: z.string().min(1),
    },
    runtimeEnv: process.env,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
