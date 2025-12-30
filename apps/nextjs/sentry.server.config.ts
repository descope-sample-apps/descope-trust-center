import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust this value in production as needed
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Configure environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

  // Disable Sentry in development if DSN is not set
  enabled:
    process.env.NODE_ENV === "production" ||
    !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
