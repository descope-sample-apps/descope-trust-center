import "server-only";

import type { DescopeSession } from "@descope-trust-center/api";

import type { getSession } from "./server";

type DescopeAuthInfo = Awaited<ReturnType<typeof getSession>>;

/**
 * Transforms Descope's session info into the tRPC DescopeSession format.
 * Used by both RSC and API route handlers for consistent session handling.
 */
export function mapDescopeSession(
  info: DescopeAuthInfo,
): DescopeSession | null {
  if (!info) return null;

  // Extract roles from all tenants
  const roles: string[] = [];
  if (info.token.tenants && typeof info.token.tenants === "object") {
    const tenants = info.token.tenants as Record<string, { roles?: unknown }>;
    for (const tenant of Object.values(tenants)) {
      const tenantRoles = tenant.roles;
      if (
        Array.isArray(tenantRoles) &&
        tenantRoles.every((r): r is string => typeof r === "string")
      ) {
        roles.push(...tenantRoles);
      }
    }
  }

  return {
    token: {
      jwt: info.jwt,
      claims: info.token,
    },
    user: {
      id: info.token.sub ?? "",
      email:
        typeof info.token.email === "string" ? info.token.email : undefined,
      name: typeof info.token.name === "string" ? info.token.name : undefined,
      verifiedEmail:
        typeof info.token.email_verified === "boolean"
          ? info.token.email_verified
          : undefined,
      roles,
    },
  };
}
