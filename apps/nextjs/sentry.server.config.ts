import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const hasDsn = typeof dsn === "string" && dsn.length > 0;

Sentry.init({
  dsn: hasDsn ? dsn : undefined,

  // Sample 10% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  debug: false,

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

  enabled: process.env.NODE_ENV === "production" || hasDsn,
});
