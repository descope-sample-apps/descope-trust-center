import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { env } from "~/env";

export const dynamic = "force-dynamic";

export function GET() {
  // Only allow in development to prevent abuse of Sentry quota
  if (env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Test endpoint disabled in production" },
      { status: 403 },
    );
  }

  try {
    throw new Error("Test Sentry error from API route");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Test error captured by Sentry" },
      { status: 500 },
    );
  }
}
