import { defineConfig } from "eslint/config";

import { baseConfig } from "@descope-trust-center/eslint-config/base";
import { reactConfig } from "@descope-trust-center/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
