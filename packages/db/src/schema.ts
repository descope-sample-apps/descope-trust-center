import { sql } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * User table - references Descope user IDs for app-specific data
 * Descope manages authentication, we just store the reference for relations
 */
export const User = pgTable("user", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  descopeUserId: t.varchar({ length: 256 }).notNull().unique(),
  email: t.varchar({ length: 256 }),
  name: t.varchar({ length: 256 }),
  createdAt: t
    .timestamp()
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: t.timestamp({ withTimezone: true }),
}));

export const CreateUserSchema = createInsertSchema(User, {
  descopeUserId: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().min(1).max(256),
  content: z.string().min(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const auditActionEnum = [
  "create",
  "update",
  "delete",
  "view",
  "download",
  "approve",
  "deny",
  "login",
  "logout",
] as const;

export const AuditLog = pgTable(
  "audit_log",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    action: t.varchar({ length: 100 }).notNull(),
    entityType: t.varchar({ length: 100 }),
    entityId: t.varchar({ length: 256 }),
    userId: t.varchar({ length: 256 }),
    userEmail: t.varchar({ length: 256 }),
    userName: t.varchar({ length: 256 }),
    details: t.jsonb(),
    ipAddress: t.varchar({ length: 45 }),
    userAgent: t.text(),
    createdAt: t.timestamp().defaultNow().notNull(),
  }),
  (table) => [
    index("audit_log_action_idx").on(table.action),
    index("audit_log_entity_type_idx").on(table.entityType),
    index("audit_log_entity_id_idx").on(table.entityId),
    index("audit_log_user_id_idx").on(table.userId),
    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);

export const CreateAuditLogSchema = createInsertSchema(AuditLog)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    action: z.enum(auditActionEnum),
  });

export const DocumentDownload = pgTable("document_download", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  documentId: t.varchar({ length: 256 }).notNull(),
  documentTitle: t.varchar({ length: 512 }).notNull(),
  userEmail: t.varchar({ length: 256 }),
  userName: t.varchar({ length: 256 }),
  company: t.varchar({ length: 256 }),
  ipAddress: t.varchar({ length: 45 }),
  userAgent: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
}));

export const FormSubmission = pgTable("form_submission", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  type: t.varchar({ length: 50 }).notNull(),
  email: t.varchar({ length: 256 }).notNull(),
  name: t.varchar({ length: 256 }),
  company: t.varchar({ length: 256 }),
  status: t.varchar({ length: 50 }).notNull().default("new"),
  metadata: t.jsonb(),
  respondedAt: t.timestamp(),
  respondedBy: t.varchar({ length: 256 }),
  responseNotes: t.text(),
  ipAddress: t.varchar({ length: 45 }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }),
}));

export const DocumentAccessRequest = pgTable(
  "document_access_request",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    documentId: t.varchar({ length: 256 }).notNull(),
    documentTitle: t.varchar({ length: 512 }).notNull(),
    email: t.varchar({ length: 256 }).notNull(),
    name: t.varchar({ length: 256 }).notNull(),
    company: t.varchar({ length: 256 }).notNull(),
    reason: t.text().notNull(),
    status: t.varchar({ length: 50 }).notNull().default("pending"),
    approvedBy: t.varchar({ length: 256 }),
    approvedAt: t.timestamp(),
    denialReason: t.text(),
    deniedBy: t.varchar({ length: 256 }),
    deniedAt: t.timestamp(),
    ipAddress: t.varchar({ length: 45 }),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ withTimezone: true }),
  }),
);

export const CreateDocumentDownloadSchema = createInsertSchema(
  DocumentDownload,
  {
    documentId: z.string().min(1),
    documentTitle: z.string().min(1),
    userEmail: z.string().email().optional(),
    userName: z.string().optional(),
    company: z.string().optional(),
  },
).omit({ id: true, createdAt: true });

export const CreateFormSubmissionSchema = createInsertSchema(FormSubmission, {
  type: z.enum(["contact", "document_request", "subprocessor_subscription"]),
  email: z.string().email(),
  name: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["new", "responded", "closed"]).default("new"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  respondedAt: true,
  respondedBy: true,
  responseNotes: true,
});

export const CreateDocumentAccessRequestSchema = createInsertSchema(
  DocumentAccessRequest,
  {
    documentId: z.string().min(1),
    documentTitle: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
    company: z.string().min(1),
    reason: z.string().min(10),
  },
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  denialReason: true,
  deniedBy: true,
  deniedAt: true,
});

export const Certification = pgTable("certification", (t) => ({
  id: t.varchar({ length: 256 }).notNull().primaryKey(),
  nameKey: t.varchar({ length: 256 }).notNull(),
  logo: t.varchar({ length: 512 }).notNull(),
  status: t.varchar({ length: 50 }).notNull().default("draft"),
  lastAuditDate: t.date(),
  expiryDate: t.date(),
  certificateUrl: t.varchar({ length: 512 }),
  descriptionKey: t.text().notNull(),
  standards: t.jsonb().notNull(),
  createdBy: t.varchar({ length: 256 }),
  updatedBy: t.varchar({ length: 256 }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }),
}));

export const CreateCertificationSchema = createInsertSchema(Certification, {
  id: z.string().min(1),
  nameKey: z.string().min(1),
  logo: z.string().url(),
  status: z.enum(["draft", "published"]).default("draft"),
  lastAuditDate: z.string().optional(),
  expiryDate: z.string().optional(),
  certificateUrl: z.string().url().optional(),
  descriptionKey: z.string().min(1),
  standards: z.array(z.string()).min(1),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}).omit({ createdAt: true, updatedAt: true });

// For admin API, use name and description
export const AdminCreateCertificationSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    logo: z.string().url(),
    status: z.enum(["draft", "published"]).default("draft"),
    lastAuditDate: z.string().optional(),
    expiryDate: z.string().optional(),
    certificateUrl: z.string().url().optional(),
    description: z.string().min(1),
    standards: z.array(z.string()).min(1),
  })
  .omit({});

export const Document = pgTable("document", (t) => ({
  id: t.varchar({ length: 256 }).notNull().primaryKey(),
  title: t.varchar({ length: 512 }).notNull(),
  category: t.varchar({ length: 100 }).notNull(),
  description: t.text().notNull(),
  accessLevel: t.varchar({ length: 50 }).notNull().default("public"),
  fileUrl: t.varchar({ length: 512 }),
  fileSize: t.varchar({ length: 50 }),
  status: t.varchar({ length: 50 }).notNull().default("draft"),
  tags: t.jsonb().notNull(),
  createdBy: t.varchar({ length: 256 }),
  updatedBy: t.varchar({ length: 256 }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }),
}));

export const CreateDocumentSchema = createInsertSchema(Document, {
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum([
    "security-policy",
    "audit-report",
    "legal",
    "questionnaire",
  ]),
  description: z.string().min(1),
  accessLevel: z
    .enum(["public", "login-required", "nda-required"])
    .default("public"),
  fileUrl: z.string().url().optional(),
  fileSize: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string()).default([]),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const Subprocessor = pgTable("subprocessor", (t) => ({
  id: t.varchar({ length: 256 }).notNull().primaryKey(),
  name: t.varchar({ length: 256 }).notNull(),
  purpose: t.text().notNull(),
  dataProcessed: t.jsonb().notNull(),
  location: t.varchar({ length: 256 }).notNull(),
  contractUrl: t.varchar({ length: 512 }).notNull(),
  status: t.varchar({ length: 50 }).notNull().default("draft"),
  createdBy: t.varchar({ length: 256 }),
  updatedBy: t.varchar({ length: 256 }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }),
}));

export const CreateSubprocessorSchema = createInsertSchema(Subprocessor, {
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  dataProcessed: z.array(z.string()).min(1),
  location: z.string().min(1),
  contractUrl: z.string().url(),
  status: z.enum(["draft", "published"]).default("draft"),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const Faq = pgTable("faq", (t) => ({
  id: t.varchar({ length: 256 }).notNull().primaryKey(),
  question: t.varchar({ length: 512 }).notNull(),
  answer: t.text().notNull(),
  category: t.varchar({ length: 100 }).notNull(),
  status: t.varchar({ length: 50 }).notNull().default("draft"),
  createdBy: t.varchar({ length: 256 }),
  updatedBy: t.varchar({ length: 256 }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }),
}));

export const CreateFaqSchema = createInsertSchema(Faq, {
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum([
    "security",
    "compliance",
    "privacy",
    "data-handling",
    "authentication",
  ]),
  status: z.enum(["draft", "published"]).default("draft"),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}).omit({ createdAt: true, updatedAt: true });
