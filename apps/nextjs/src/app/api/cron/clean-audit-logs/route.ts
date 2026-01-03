import { NextRequest, NextResponse } from "next/server";

import { AuditLog, lt } from "@descope-trust-center/db";
import { db } from "@descope-trust-center/db/client";

import { env } from "~/env";

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  const cronSecret = request.headers.get("x-vercel-cron");
  if (!cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const daysOld = env.AUDIT_LOG_RETENTION_DAYS;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db
      .delete(AuditLog)
      .where(lt(AuditLog.createdAt, cutoffDate));

    console.log(
      `Cleaned up ${result.rowCount} audit logs older than ${cutoffDate.toISOString()}`,
    );

    return NextResponse.json({
      success: true,
      deletedCount: result.rowCount,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error("Audit log cleanup failed:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
