import { authMiddleware } from "@descope/nextjs-sdk/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/trpc/*"],
});

export const config = {
  // Match all routes except:
  // - Static files with extensions (e.g., .js, .css, .png)
  // - Next.js internals (_next/*)
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
