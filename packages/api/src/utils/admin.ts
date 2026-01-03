import { AuditLog } from "@descope-trust-center/db";
import { db } from "@descope-trust-center/db/client";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? [];
const ADMIN_DOMAINS = ["descope.com"];

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  const domain = email.split("@")[1];
  return domain ? ADMIN_DOMAINS.includes(domain) : false;
}

export async function logAuditEvent(input: {
  userId?: string;
  action: string;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await db.insert(AuditLog).values(input);
  } catch (error) {
    console.error("[AUDIT] Failed to log audit event:", error);
  }
}
