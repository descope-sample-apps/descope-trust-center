import * as fs from "fs";
import * as path from "path";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod/v4";

import {
  Certification,
  CreateCertificationSchema,
  CreateDocumentSchema,
  CreateFaqSchema,
  CreateSubprocessorSchema,
  Document,
  Faq,
  Subprocessor,
} from "@descope-trust-center/db";
import {
  CertificationsSchema,
  DocumentCategorySchema,
  DocumentsSchema,
  FAQCategorySchema,
  FAQsSchema,
  SubprocessorsSchema,
  SubprocessorSubscriptionSchema,
} from "@descope-trust-center/validators";

import { protectedProcedure, publicProcedure } from "../trpc";
import { isAdmin, logAuditEvent } from "../utils/admin";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdmin(ctx.session.user.email)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

/**
 * Reads and parses a JSON data file from the Next.js app data directory
 */
function readDataFile<T>(filename: string): T {
  const dataPath = path.resolve(
    process.cwd(),
    "apps/nextjs/src/app/data",
    filename,
  );
  const content = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(content) as T;
}

/**
 * Contact form submission schema
 */
const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Valid email is required"),
  company: z.string().min(1, "Company is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

/**
 * Document request schema for NDA-required documents
 */
const DocumentRequestSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Valid email is required"),
  company: z.string().min(1, "Company is required"),
  reason: z.string().min(10, "Please provide a reason for access"),
});

/**
 * Trust Center tRPC router
 *
 * Provides endpoints for:
 * - Querying certifications, documents, subprocessors, and FAQs
 * - Submitting contact forms and document access requests
 */
export const trustCenterRouter = {
  // ==================== Query Endpoints ====================

  /**
   * Returns all certifications
   */
  getCertifications: publicProcedure.query(() => {
    const data = readDataFile<unknown[]>("certifications.json");
    return CertificationsSchema.parse(data);
  }),

  /**
   * Returns all documents, optionally filtered by category
   */
  getDocuments: publicProcedure
    .input(
      z
        .object({
          category: DocumentCategorySchema.optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const data = readDataFile<unknown[]>("documents.json");
      const documents = DocumentsSchema.parse(data);

      if (input?.category) {
        return documents.filter((doc) => doc.category === input.category);
      }

      return documents;
    }),

  /**
   * Returns all subprocessors
   */
  getSubprocessors: publicProcedure.query(() => {
    const data = readDataFile<unknown[]>("subprocessors.json");
    return SubprocessorsSchema.parse(data);
  }),

  /**
   * Returns all FAQs, optionally filtered by category
   */
  getFAQs: publicProcedure
    .input(
      z
        .object({
          category: FAQCategorySchema.optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const data = readDataFile<unknown[]>("faqs.json");
      const faqs = FAQsSchema.parse(data);

      if (input?.category) {
        return faqs.filter((faq) => faq.category === input.category);
      }

      return faqs;
    }),

  // ==================== Mutation Endpoints ====================

  /**
   * Submits a security inquiry contact form
   * For v1: logs to console (no email/database integration)
   */
  submitContactForm: publicProcedure
    .input(ContactFormSchema)
    .mutation(({ input }) => {
      // v1: Log to console - email/database integration to be added later
      console.log("[Trust Center] Contact form submission:", {
        name: input.name,
        email: input.email,
        company: input.company,
        message: input.message,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message:
          "Thank you for your inquiry. We will respond within 2 business days.",
      };
    }),

  /**
   * Requests access to an NDA-required document
   * For v1: logs to console (no email/database integration)
   */
  requestDocument: publicProcedure
    .input(DocumentRequestSchema)
    .mutation(({ input }) => {
      // v1: Log to console - email/database integration to be added later
      console.log("[Trust Center] Document access request:", {
        documentId: input.documentId,
        name: input.name,
        email: input.email,
        company: input.company,
        reason: input.reason,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message:
          "Your document access request has been submitted. Our security team will review and respond within 3 business days.",
      };
    }),

  subscribeToSubprocessorUpdates: publicProcedure
    .input(SubprocessorSubscriptionSchema)
    .mutation(({ input }) => {
      console.log("[Trust Center] Subprocessor subscription:", {
        email: input.email,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message:
          "You're subscribed! We'll notify you when our subprocessor list changes.",
      };
    }),

  // ==================== Admin Content Management ====================

  createCertification: adminProcedure
    .input(CreateCertificationSchema)
    .mutation(async ({ ctx, input }) => {
      const [certification] = await ctx.db
        .insert(Certification)
        .values(input)
        .returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "create",
        resource: "certification",
        details: { certificationId: certification?.id },
      });
      return certification;
    }),

  updateCertification: adminProcedure
    .input(CreateCertificationSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [certification] = await ctx.db
        .update(Certification)
        .set(data)
        .where(eq(Certification.id, id))
        .returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "update",
        resource: "certification",
        details: { certificationId: id },
      });
      return certification;
    }),

  deleteCertification: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(Certification).where(eq(Certification.id, input.id));
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "delete",
        resource: "certification",
        details: { certificationId: input.id },
      });
      return { success: true };
    }),

  createDocument: adminProcedure
    .input(CreateDocumentSchema.omit({ updatedAt: true }))
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .insert(Document)
        .values(input)
        .returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "create",
        resource: "document",
        details: { documentId: document?.id },
      });
      return document;
    }),

  updateDocument: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z
          .enum(["security-policy", "audit-report", "legal", "questionnaire"])
          .optional(),
        accessLevel: z
          .enum(["public", "login-required", "nda-required"])
          .optional(),
        fileUrl: z.string().url().optional(),
        fileSize: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [document] = await ctx.db
        .update(Document)
        .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(Document.id, id))
        .returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "update",
        resource: "document",
        details: { documentId: id },
      });
      return document;
    }),

  deleteDocument: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(Document).where(eq(Document.id, input.id));
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "delete",
        resource: "document",
        details: { documentId: input.id },
      });
      return { success: true };
    }),

  createFaq: adminProcedure
    .input(CreateFaqSchema)
    .mutation(async ({ ctx, input }) => {
      const [faq] = await ctx.db.insert(Faq).values(input).returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "create",
        resource: "faq",
        details: { faqId: faq?.id },
      });
      return faq;
    }),

  updateFaq: adminProcedure
    .input(CreateFaqSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [faq] = await ctx.db
        .update(Faq)
        .set(data)
        .where(eq(Faq.id, id))
        .returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "update",
        resource: "faq",
        details: { faqId: id },
      });
      return faq;
    }),

  deleteFaq: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(Faq).where(eq(Faq.id, input.id));
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "delete",
        resource: "faq",
        details: { faqId: input.id },
      });
      return { success: true };
    }),

  createSubprocessor: adminProcedure
    .input(CreateSubprocessorSchema)
    .mutation(async ({ ctx, input }) => {
      const [subprocessor] = await ctx.db
        .insert(Subprocessor)
        .values(input)
        .returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "create",
        resource: "subprocessor",
        details: { subprocessorId: subprocessor?.id },
      });
      return subprocessor;
    }),

  updateSubprocessor: adminProcedure
    .input(CreateSubprocessorSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [subprocessor] = await ctx.db
        .update(Subprocessor)
        .set(data)
        .where(eq(Subprocessor.id, id))
        .returning();
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "update",
        resource: "subprocessor",
        details: { subprocessorId: id },
      });
      return subprocessor;
    }),

  deleteSubprocessor: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(Subprocessor).where(eq(Subprocessor.id, input.id));
      await logAuditEvent({
        userId: ctx.session.user.id,
        action: "delete",
        resource: "subprocessor",
        details: { subprocessorId: input.id },
      });
      return { success: true };
    }),
} satisfies TRPCRouterRecord;
