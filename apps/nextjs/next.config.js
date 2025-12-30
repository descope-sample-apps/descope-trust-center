import { withSentryConfig } from "@sentry/nextjs";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: [
    "@descope-trust-center/api",
    "@descope-trust-center/auth",
    "@descope-trust-center/db",
    "@descope-trust-center/ui",
    "@descope-trust-center/validators",
  ],

  typescript: { ignoreBuildErrors: true },
};

export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: false,
  },
  disableLogger: true,
  automaticVercelMonitors: true,
});
