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
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  status: t.varchar({ length: 50 }).notNull().default("pending"),
  metadata: t.jsonb(),
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
  status: z
    .enum(["pending", "approved", "denied", "completed"])
    .default("pending"),
}).omit({ id: true, createdAt: true, updatedAt: true });

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

export const certificationStatusEnum = [
  "active",
  "in-progress",
  "expired",
  "pending-renewal",
] as const;

export const Certification = pgTable(
  "certification",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    name: t.varchar({ length: 256 }).notNull(),
    slug: t.varchar({ length: 256 }).notNull().unique(),
    logo: t.varchar({ length: 512 }),
    status: t.varchar({ length: 50 }).notNull().default("active"),
    lastAuditDate: t.date(),
    expiryDate: t.date(),
    certificateUrl: t.varchar({ length: 1024 }),
    description: t.text().notNull(),
    standards: t.jsonb().$type<string[]>().default([]),
    sortOrder: t.integer().notNull().default(0),
    isPublished: t.boolean().notNull().default(true),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("certification_status_idx").on(table.status),
    index("certification_is_published_idx").on(table.isPublished),
    index("certification_sort_order_idx").on(table.sortOrder),
  ],
);

export const CreateCertificationSchema = createInsertSchema(Certification, {
  name: z.string().min(1).max(256),
  slug: z.string().min(1).max(256),
  logo: z.string().url().optional(),
  status: z.enum(certificationStatusEnum).default("active"),
  lastAuditDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  certificateUrl: z.string().url().optional(),
  description: z.string().min(1),
  standards: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const documentCategoryEnum = [
  "security-policy",
  "compliance",
  "legal",
  "questionnaire",
  "audit-report",
  "technical",
] as const;

export const documentAccessLevelEnum = [
  "public",
  "login-required",
  "nda-required",
] as const;

export const Document = pgTable(
  "document",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    title: t.varchar({ length: 512 }).notNull(),
    slug: t.varchar({ length: 256 }).notNull().unique(),
    category: t.varchar({ length: 50 }).notNull(),
    description: t.text().notNull(),
    accessLevel: t.varchar({ length: 50 }).notNull().default("public"),
    fileUrl: t.varchar({ length: 1024 }),
    fileSize: t.varchar({ length: 50 }),
    fileMimeType: t.varchar({ length: 100 }),
    tags: t.jsonb().$type<string[]>().default([]),
    sortOrder: t.integer().notNull().default(0),
    isPublished: t.boolean().notNull().default(true),
    downloadCount: t.integer().notNull().default(0),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("document_category_idx").on(table.category),
    index("document_access_level_idx").on(table.accessLevel),
    index("document_is_published_idx").on(table.isPublished),
  ],
);

export const CreateDocumentSchema = createInsertSchema(Document, {
  title: z.string().min(1).max(512),
  slug: z.string().min(1).max(256),
  category: z.enum(documentCategoryEnum),
  description: z.string().min(1),
  accessLevel: z.enum(documentAccessLevelEnum).default("public"),
  fileUrl: z.string().url().optional(),
  fileSize: z.string().optional(),
  fileMimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, downloadCount: true });

export const subprocessorStatusEnum = [
  "active",
  "inactive",
  "under-review",
] as const;

export const Subprocessor = pgTable(
  "subprocessor",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    name: t.varchar({ length: 256 }).notNull(),
    slug: t.varchar({ length: 256 }).notNull().unique(),
    purpose: t.text().notNull(),
    dataProcessed: t.jsonb().$type<string[]>().notNull().default([]),
    location: t.varchar({ length: 256 }).notNull(),
    contractUrl: t.varchar({ length: 1024 }),
    status: t.varchar({ length: 50 }).notNull().default("active"),
    sortOrder: t.integer().notNull().default(0),
    isPublished: t.boolean().notNull().default(true),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("subprocessor_status_idx").on(table.status),
    index("subprocessor_is_published_idx").on(table.isPublished),
  ],
);

export const CreateSubprocessorSchema = createInsertSchema(Subprocessor, {
  name: z.string().min(1).max(256),
  slug: z.string().min(1).max(256),
  purpose: z.string().min(1),
  dataProcessed: z.array(z.string()),
  location: z.string().min(1).max(256),
  contractUrl: z.string().url().optional(),
  status: z.enum(subprocessorStatusEnum).default("active"),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const faqCategoryEnum = [
  "security",
  "compliance",
  "privacy",
  "data-handling",
  "authentication",
  "general",
] as const;

export const FAQ = pgTable(
  "faq",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    question: t.text().notNull(),
    answer: t.text().notNull(),
    category: t.varchar({ length: 50 }).notNull(),
    sortOrder: t.integer().notNull().default(0),
    isPublished: t.boolean().notNull().default(true),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("faq_category_idx").on(table.category),
    index("faq_is_published_idx").on(table.isPublished),
    index("faq_sort_order_idx").on(table.sortOrder),
  ],
);

export const CreateFAQSchema = createInsertSchema(FAQ, {
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(faqCategoryEnum),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

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
    action: t.varchar({ length: 50 }).notNull(),
    entityType: t.varchar({ length: 100 }).notNull(),
    entityId: t.varchar({ length: 256 }),
    userId: t.varchar({ length: 256 }),
    userEmail: t.varchar({ length: 256 }),
    userName: t.varchar({ length: 256 }),
    metadata: t.jsonb(),
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

export const CreateAuditLogSchema = createInsertSchema(AuditLog, {
  action: z.enum(auditActionEnum),
  entityType: z.string().min(1),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
}).omit({ id: true, createdAt: true });
