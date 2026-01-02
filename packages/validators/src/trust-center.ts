import { z } from "zod/v4";

/**
 * Certification status representing the current state of a compliance certification
 */
export const CertificationStatusSchema = z.enum([
  "active",
  "in-progress",
  "expired",
  "pending-renewal",
]);
export type CertificationStatus = z.infer<typeof CertificationStatusSchema>;

/**
 * Schema for compliance certifications (SOC 2, ISO 27001, GDPR, etc.)
 */
export const CertificationSchema = z.object({
  id: z.string().describe("Unique identifier for the certification"),
  name: z.string().describe("Display name of the certification"),
  logo: z.string().optional().describe("URL or path to certification logo"),
  status: CertificationStatusSchema.describe("Current certification status"),
  lastAuditDate: z
    .string()
    .date()
    .optional()
    .describe("Date of last audit in ISO format"),
  expiryDate: z
    .string()
    .date()
    .optional()
    .describe("Expiry date in ISO format"),
  certificateUrl: z
    .string()
    .url()
    .optional()
    .describe("URL to view/download certificate"),
  description: z.string().describe("Brief description of the certification"),
  standards: z
    .array(z.string())
    .optional()
    .describe("Related standards or frameworks"),
});
export type Certification = z.infer<typeof CertificationSchema>;
export const CertificationsSchema = z.array(CertificationSchema);
export type Certifications = z.infer<typeof CertificationsSchema>;

/**
 * Document access levels controlling who can view/download
 */
export const DocumentAccessLevelSchema = z.enum([
  "public",
  "login-required",
  "nda-required",
]);
export type DocumentAccessLevel = z.infer<typeof DocumentAccessLevelSchema>;

/**
 * Document categories for organization
 */
export const DocumentCategorySchema = z.enum([
  "security-policy",
  "compliance",
  "legal",
  "questionnaire",
  "audit-report",
  "technical",
]);
export type DocumentCategory = z.infer<typeof DocumentCategorySchema>;

/**
 * Schema for Trust Center documents (policies, reports, questionnaires)
 */
export const DocumentSchema = z.object({
  id: z.string().describe("Unique identifier for the document"),
  title: z.string().describe("Document title"),
  category: DocumentCategorySchema.describe("Document category"),
  description: z.string().describe("Brief description of document contents"),
  accessLevel: DocumentAccessLevelSchema.describe(
    "Required access level to view/download",
  ),
  fileUrl: z.string().optional().describe("URL to the document file"),
  fileSize: z.string().optional().describe("Human-readable file size"),
  updatedAt: z.string().date().describe("Last updated date in ISO format"),
  tags: z.array(z.string()).optional().describe("Searchable tags"),
});
export type Document = z.infer<typeof DocumentSchema>;
export const DocumentsSchema = z.array(DocumentSchema);
export type Documents = z.infer<typeof DocumentsSchema>;

/**
 * Subprocessor status
 */
export const SubprocessorStatusSchema = z.enum([
  "active",
  "inactive",
  "under-review",
]);
export type SubprocessorStatus = z.infer<typeof SubprocessorStatusSchema>;

/**
 * Schema for subprocessors (third-party data processors)
 */
export const SubprocessorSchema = z.object({
  id: z.string().describe("Unique identifier for the subprocessor"),
  name: z.string().describe("Company name of the subprocessor"),
  purpose: z.string().describe("Purpose of data processing"),
  dataProcessed: z
    .array(z.string())
    .describe("Types of data processed by this subprocessor"),
  location: z.string().describe("Primary data processing location"),
  contractUrl: z
    .string()
    .url()
    .optional()
    .describe("URL to DPA or contract details"),
  status: SubprocessorStatusSchema.describe("Current status of the contract"),
});
export type Subprocessor = z.infer<typeof SubprocessorSchema>;
export const SubprocessorsSchema = z.array(SubprocessorSchema);
export type Subprocessors = z.infer<typeof SubprocessorsSchema>;

/**
 * FAQ categories
 */
export const FAQCategorySchema = z.enum([
  "security",
  "compliance",
  "privacy",
  "data-handling",
  "authentication",
  "general",
]);
export type FAQCategory = z.infer<typeof FAQCategorySchema>;

/**
 * Schema for frequently asked questions
 */
export const FAQSchema = z.object({
  id: z.string().describe("Unique identifier for the FAQ"),
  question: z.string().describe("The question being answered"),
  answer: z.string().describe("The answer (supports markdown)"),
  category: FAQCategorySchema.describe("FAQ category for filtering"),
});
export type FAQ = z.infer<typeof FAQSchema>;
export const FAQsSchema = z.array(FAQSchema);
export type FAQs = z.infer<typeof FAQsSchema>;

/**
 * Contact form request types
 */
export const ContactRequestTypeSchema = z.enum([
  "request-document",
  "security-question",
  "schedule-security-review",
  "other",
]);
export type ContactRequestType = z.infer<typeof ContactRequestTypeSchema>;

export const SubprocessorSubscriptionSchema = z.object({
  email: z.email("Please enter a valid email address"),
});
export type SubprocessorSubscription = z.infer<
  typeof SubprocessorSubscriptionSchema
>;
