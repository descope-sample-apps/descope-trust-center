import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { session } from "@descope/nextjs-sdk/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "de", "es", "fr", "ja"],
  defaultLocale: "en",
  localePrefix: "always",
});

interface DescopeSessionInfo {
  jwt: string;
  token: {
    sub?: string;
    tenants?: Record<string, { roles?: unknown }>;
  };
}

// Helper to extract roles from Descope session token
function getRolesFromSession(sessionInfo: DescopeSessionInfo): string[] {
  const roles: string[] = [];
  if (
    sessionInfo.token.tenants &&
    typeof sessionInfo.token.tenants === "object"
  ) {
    const tenants = sessionInfo.token.tenants as Record<
      string,
      { roles?: unknown }
    >;
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
  return roles;
}

export default async function middleware(request: NextRequest) {
  // Handle i18n first
  const intlResponse = intlMiddleware(request);
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  const { pathname } = request.nextUrl;

  // Define public routes (no auth required)
  const publicRoutes = ["/", "/api/trpc/*"];

  // Check if path matches public routes
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("*")) {
      const regex = new RegExp(`^${route.replace("*", ".*")}$`);
      return regex.test(pathname);
    }
    return pathname === route;
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    const sessionInfo = await session();

    if (!sessionInfo?.token.sub) {
      // Not authenticated - redirect to sign in
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Validate admin role
    const roles = getRolesFromSession(sessionInfo);
    if (!roles.includes("admin")) {
      // Authenticated but not admin - return 403
      return new NextResponse("Access Denied", { status: 403 });
    }

    // Valid admin user - continue
    return NextResponse.next();
  }

  // All other routes require authentication (default behavior)
  const sessionInfo = await session();
  if (!sessionInfo?.token.sub) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
