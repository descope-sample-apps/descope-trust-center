import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
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
