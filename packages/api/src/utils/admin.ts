import { AuditLog } from "@descope-trust-center/db";

import type { Context } from "../trpc";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? [];
const ADMIN_DOMAINS = ["descope.com"];

export function isAdmin(
  email: string | undefined | null,
  roles: string[] = [],
): boolean {
  // Check roles first (new role-based access)
  if (roles.includes("admin")) return true;

  // Fallback to email-based access
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  const domain = email.split("@")[1];
  return domain ? ADMIN_DOMAINS.includes(domain) : false;
}

export async function logAuditEvent(
  ctx: Context,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
) {
  try {
    await ctx.db.insert(AuditLog).values({
      action,
      entityType,
      entityId,
      userId: ctx.session?.user.id,
      userEmail: ctx.session?.user.email,
      userName: ctx.session?.user.name,
      details,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  } catch (error) {
    // Audit logging should not block business operations
    console.error("Failed to log audit event:", error);
  }
}
