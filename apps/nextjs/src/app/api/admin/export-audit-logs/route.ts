import { NextRequest, NextResponse } from "next/server";

import { and, eq, gte, lte, sql, desc } from "@descope-trust-center/db";
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

export async function GET(request: NextRequest) {
  // Check admin auth
  const session = await getSession();
  if (!session || !isAdmin((session as any).user?.email, (session as any).user?.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const userEmail = searchParams.get("userEmail") || undefined;
  const action = searchParams.get("action") || undefined;
  const entityType = searchParams.get("entityType") || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;

  const conditions = [];
  if (userEmail) conditions.push(eq(AuditLog.userEmail, userEmail));
  if (action) conditions.push(sql`${AuditLog.action} LIKE ${`%${action}%`}`);
  if (entityType) conditions.push(sql`${AuditLog.entityType} LIKE ${`%${entityType}%`}`);
  if (fromDate) conditions.push(gte(AuditLog.createdAt, new Date(fromDate)));
  if (toDate) conditions.push(lte(AuditLog.createdAt, new Date(toDate)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const logs = await db
    .select()
    .from(AuditLog)
    .where(whereClause)
    .orderBy(desc(AuditLog.createdAt));

  if (format === "json") {
    return NextResponse.json(logs);
  }

  // Generate CSV
  const headers = [
    "ID",
    "User Email",
    "Action",
    "Entity Type",
    "Details",
    "IP Address",
    "User Agent",
    "Created At",
  ];

  const csvRows = [
    headers.join(","),
    ...logs.map((log) =>
      [
        log.id,
        log.userEmail ?? "",
        log.action,
        log.entityType ?? "",
        JSON.stringify(log.details ?? {}, null, 0)
          .replace(/\n/g, " ")
          .replace(/"/g, '""'), // Escape quotes and newlines in JSON
        log.ipAddress ?? "",
        (log.userAgent ?? "").replace(/"/g, '""'), // Escape quotes
        log.createdAt.toISOString(),
      ]
        .map((field) => `"${field}"`)
        .join(","),
    ),
  ];

  const csv = csvRows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const userEmail = searchParams.get("userEmail") || undefined;
  const action = searchParams.get("action") || undefined;
  const entityType = searchParams.get("entityType") || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;

  const conditions = [];
  if (userEmail) conditions.push(eq(AuditLog.userEmail, userEmail));
  if (action) conditions.push(sql`${AuditLog.action} LIKE ${`%${action}%`}`);
  if (entityType)
    conditions.push(sql`${AuditLog.entityType} LIKE ${`%${entityType}%`}`);
  if (fromDate) conditions.push(gte(AuditLog.createdAt, new Date(fromDate)));
  if (toDate) conditions.push(lte(AuditLog.createdAt, new Date(toDate)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const logs = await db
    .select()
    .from(AuditLog)
    .where(whereClause)
    .orderBy(desc(AuditLog.createdAt));

  if (format === "json") {
    return NextResponse.json(logs);
  }

  // Generate CSV
  const headers = [
    "ID",
    "User Email",
    "Action",
    "Entity Type",
    "Details",
    "IP Address",
    "User Agent",
    "Created At",
  ];

  const csvRows = [
    headers.join(","),
    ...logs.map((log) =>
      [
        log.id,
        log.userEmail ?? "",
        log.action,
        log.entityType ?? "",
        JSON.stringify(log.details ?? {}, null, 0)
          .replace(/\n/g, " ")
          .replace(/"/g, '""'),
        log.ipAddress ?? "",
        (log.userAgent ?? "").replace(/"/g, '""'),
        log.createdAt.toISOString(),
      ]
        .map((field) => `"${field}"`)
        .join(","),
    ),
  ];

  const csv = csvRows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
