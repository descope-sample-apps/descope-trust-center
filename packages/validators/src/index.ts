import { z } from "zod/v4";

export const unused = z.string().describe(
  `This lib is currently not used as we use drizzle-zod for simple schemas
   But as your application grows and you need other validators to share
   with back and frontend, you can put them in here
  `,
);

// Trust Center schemas
export {
  // Certifications
  CertificationStatusSchema,
  CertificationSchema,
  CertificationsSchema,
  type CertificationStatus,
  type Certification,
  type Certifications,
  // Documents
  DocumentAccessLevelSchema,
  DocumentCategorySchema,
  DocumentSchema,
  DocumentsSchema,
  type DocumentAccessLevel,
  type DocumentCategory,
  type Document,
  type Documents,
  // Subprocessors
  SubprocessorStatusSchema,
  SubprocessorSchema,
  SubprocessorsSchema,
  type SubprocessorStatus,
  type Subprocessor,
  type Subprocessors,
  // FAQs
  FAQCategorySchema,
  FAQSchema,
  FAQsSchema,
  type FAQCategory,
  type FAQ,
  type FAQs,
  SubprocessorSubscriptionSchema,
  type SubprocessorSubscription,
} from "./trust-center";
