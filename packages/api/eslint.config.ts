import { defineConfig } from "eslint/config";

import { baseConfig } from "@descope-trust-center/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**", "**/__tests__/**"],
  },
  baseConfig,
);
