import { analyticsRouter } from "./router/analytics";
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { trustCenterRouter } from "./router/trust-center";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  analytics: analyticsRouter,
  auth: authRouter,
  post: postRouter,
  trustCenter: trustCenterRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
