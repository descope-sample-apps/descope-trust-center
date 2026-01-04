import { createTRPCRouter } from "../trpc";
import { adminCertificationRouter } from "./admin-certifications";

export const adminRouter = createTRPCRouter({
  certifications: adminCertificationRouter,
  // TODO: add documents, subprocessors, faqs routers
});

export type AdminRouter = typeof adminRouter;
