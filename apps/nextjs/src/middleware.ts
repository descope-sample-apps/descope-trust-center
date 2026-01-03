import type { NextRequest } from "next/server";
import { authMiddleware } from "@descope/nextjs-sdk/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "de", "es", "fr", "ja"],
  defaultLocale: "en",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  if (intlResponse.status !== 200) {
    return intlResponse;
  }
  return authMiddleware({
    publicRoutes: ["/", "/api/trpc/*"],
  })(request);
}

export const config = {
  // Match all routes except:
  // - Static files with extensions (e.g., .js, .css, .png)
  // - Next.js internals (_next/*)
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
