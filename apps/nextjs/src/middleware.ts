import { authMiddleware } from "@descope/nextjs-sdk/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/trpc/*"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
