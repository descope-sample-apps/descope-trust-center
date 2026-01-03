import { NextRequest, NextResponse } from "next/server";

import { lt } from "@descope-trust-center/db";
import { AuditLog } from "@descope-trust-center/db/schema";
import { db } from "@descope-trust-center/db/client";

import { getSession } from "~/auth/server";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? [];
const ADMIN_DOMAINS = ["descope.com"];

function isAdmin(email: string | undefined | null, roles: string[] = []): boolean {
  // Check roles first (new role-based access)
  if (roles.includes("admin")) return true;

  // Fallback to email-based access
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  const domain = email.split("@")[1];
  return domain ? ADMIN_DOMAINS.includes(domain) : false;
}

export async function POST(request: NextRequest) {
  // Check admin auth
  const session = await getSession();
  if (!session || !isAdmin((session as any).user?.email, (session as any).user?.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { daysOld = 90 } = await request.json();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(AuditLog)
    .where(lt(AuditLog.createdAt, cutoffDate));

  return NextResponse.json({
    deletedCount: result.rowCount,
    cutoffDate: cutoffDate.toISOString(),
  });
}

  const { daysOld = 90 } = await request.json();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(AuditLog)
    .where(lt(AuditLog.createdAt, cutoffDate));

  return NextResponse.json({
    deletedCount: result.rowCount,
    cutoffDate: cutoffDate.toISOString(),
  });
}
