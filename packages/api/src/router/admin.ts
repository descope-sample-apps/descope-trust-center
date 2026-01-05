import { createTRPCRouter } from "../trpc";
import { adminCertificationRouter } from "./admin-certifications";
import { adminDocumentRouter } from "./admin-documents";
import { adminFaqRouter } from "./admin-faqs";
import { adminSubprocessorRouter } from "./admin-subprocessors";

export const adminRouter = createTRPCRouter({
  certifications: adminCertificationRouter,
  documents: adminDocumentRouter,
  subprocessors: adminSubprocessorRouter,
  faqs: adminFaqRouter,
});

export type AdminRouter = typeof adminRouter;
