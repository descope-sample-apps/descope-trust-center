import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  Certification,
  CreateCertificationSchema,
  CreateDocumentSchema,
  CreateFaqSchema,
  CreateSubprocessorSchema,
  desc,
  Document,
  eq,
  Faq,
  Subprocessor,
} from "@descope-trust-center/db";

import { protectedProcedure } from "../trpc";
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

// Publish schema for updating publish status
const PublishInputSchema = z.object({
  id: z.string(),
  publishStatus: z.enum(["draft", "published"]),
});

export const adminContentRouter = {
  // ==================== Certifications ====================

  getCertifications: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(Certification)
      .orderBy(desc(Certification.createdAt));
  }),

  getCertification: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [certification] = await ctx.db
        .select()
        .from(Certification)
        .where(eq(Certification.id, input.id));
      if (!certification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }
      return certification;
    }),

  createCertification: adminProcedure
    .input(CreateCertificationSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(Certification)
        .values(input)
        .returning();

      const certification = result[0];
      if (!certification) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create certification",
        });
      }

      await logAuditEvent(ctx, "create", "certification", certification.id, {
        name: certification.name,
      });

      return certification;
    }),

  updateCertification: adminProcedure
    .input(CreateCertificationSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const [certification] = await ctx.db
        .update(Certification)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(Certification.id, id))
        .returning();

      if (!certification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }

      await logAuditEvent(ctx, "update", "certification", id, {
        name: certification.name,
      });

      return certification;
    }),

  deleteCertification: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [certification] = await ctx.db
        .delete(Certification)
        .where(eq(Certification.id, input.id))
        .returning();

      if (!certification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }

      await logAuditEvent(ctx, "delete", "certification", input.id, {
        name: certification.name,
      });

      return certification;
    }),

  publishCertification: adminProcedure
    .input(PublishInputSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData =
        input.publishStatus === "published"
          ? {
              publishStatus: "published" as const,
              publishedAt: new Date(),
              publishedBy: ctx.session.user.id,
            }
          : {
              publishStatus: "draft" as const,
              publishedAt: null,
              publishedBy: null,
            };

      const [certification] = await ctx.db
        .update(Certification)
        .set(updateData)
        .where(eq(Certification.id, input.id))
        .returning();

      if (!certification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification not found",
        });
      }

      await logAuditEvent(
        ctx,
        input.publishStatus === "published" ? "approve" : "update",
        "certification",
        input.id,
        {
          name: certification.name,
          action: input.publishStatus,
        },
      );

      return certification;
    }),

  // ==================== Documents ====================

  getDocuments: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(Document)
      .orderBy(desc(Document.createdAt));
  }),

  getDocument: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .select()
        .from(Document)
        .where(eq(Document.id, input.id));
      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }
      return document;
    }),

  createDocument: adminProcedure
    .input(CreateDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(Document).values(input).returning();

      const document = result[0];
      if (!document) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create document",
        });
      }

      await logAuditEvent(ctx, "create", "document", document.id, {
        title: document.title,
        category: document.category,
      });

      return document;
    }),

  updateDocument: adminProcedure
    .input(CreateDocumentSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const [document] = await ctx.db
        .update(Document)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(Document.id, id))
        .returning();

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await logAuditEvent(ctx, "update", "document", id, {
        title: document.title,
        category: document.category,
      });

      return document;
    }),

  deleteDocument: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .delete(Document)
        .where(eq(Document.id, input.id))
        .returning();

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await logAuditEvent(ctx, "delete", "document", input.id, {
        title: document.title,
        category: document.category,
      });

      return document;
    }),

  publishDocument: adminProcedure
    .input(PublishInputSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData =
        input.publishStatus === "published"
          ? {
              publishStatus: "published" as const,
              publishedAt: new Date(),
              publishedBy: ctx.session.user.id,
            }
          : {
              publishStatus: "draft" as const,
              publishedAt: null,
              publishedBy: null,
            };

      const [document] = await ctx.db
        .update(Document)
        .set(updateData)
        .where(eq(Document.id, input.id))
        .returning();

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      await logAuditEvent(
        ctx,
        input.publishStatus === "published" ? "approve" : "update",
        "document",
        input.id,
        {
          title: document.title,
          action: input.publishStatus,
        },
      );

      return document;
    }),

  // ==================== Subprocessors ====================

  getSubprocessors: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(Subprocessor)
      .orderBy(desc(Subprocessor.createdAt));
  }),

  getSubprocessor: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [subprocessor] = await ctx.db
        .select()
        .from(Subprocessor)
        .where(eq(Subprocessor.id, input.id));
      if (!subprocessor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subprocessor not found",
        });
      }
      return subprocessor;
    }),

  createSubprocessor: adminProcedure
    .input(CreateSubprocessorSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(Subprocessor)
        .values(input)
        .returning();

      const subprocessor = result[0];
      if (!subprocessor) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subprocessor",
        });
      }

      await logAuditEvent(ctx, "create", "subprocessor", subprocessor.id, {
        name: subprocessor.name,
        location: subprocessor.location,
      });

      return subprocessor;
    }),

  updateSubprocessor: adminProcedure
    .input(CreateSubprocessorSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const [subprocessor] = await ctx.db
        .update(Subprocessor)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(Subprocessor.id, id))
        .returning();

      if (!subprocessor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subprocessor not found",
        });
      }

      await logAuditEvent(ctx, "update", "subprocessor", id, {
        name: subprocessor.name,
        location: subprocessor.location,
      });

      return subprocessor;
    }),

  deleteSubprocessor: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [subprocessor] = await ctx.db
        .delete(Subprocessor)
        .where(eq(Subprocessor.id, input.id))
        .returning();

      if (!subprocessor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subprocessor not found",
        });
      }

      await logAuditEvent(ctx, "delete", "subprocessor", input.id, {
        name: subprocessor.name,
        location: subprocessor.location,
      });

      return subprocessor;
    }),

  publishSubprocessor: adminProcedure
    .input(PublishInputSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData =
        input.publishStatus === "published"
          ? {
              publishStatus: "published" as const,
              publishedAt: new Date(),
              publishedBy: ctx.session.user.id,
            }
          : {
              publishStatus: "draft" as const,
              publishedAt: null,
              publishedBy: null,
            };

      const [subprocessor] = await ctx.db
        .update(Subprocessor)
        .set(updateData)
        .where(eq(Subprocessor.id, input.id))
        .returning();

      if (!subprocessor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subprocessor not found",
        });
      }

      await logAuditEvent(
        ctx,
        input.publishStatus === "published" ? "approve" : "update",
        "subprocessor",
        input.id,
        {
          name: subprocessor.name,
          action: input.publishStatus,
        },
      );

      return subprocessor;
    }),

  // ==================== FAQs ====================

  getFAQs: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(Faq).orderBy(desc(Faq.createdAt));
  }),

  getFAQ: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [faq] = await ctx.db.select().from(Faq).where(eq(Faq.id, input.id));
      if (!faq) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "FAQ not found",
        });
      }
      return faq;
    }),

  createFAQ: adminProcedure
    .input(CreateFaqSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(Faq).values(input).returning();

      const faq = result[0];
      if (!faq) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create FAQ",
        });
      }

      await logAuditEvent(ctx, "create", "faq", faq.id, {
        question: faq.question,
        category: faq.category,
      });

      return faq;
    }),

  updateFAQ: adminProcedure
    .input(CreateFaqSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const [faq] = await ctx.db
        .update(Faq)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(Faq.id, id))
        .returning();

      if (!faq) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "FAQ not found",
        });
      }

      await logAuditEvent(ctx, "update", "faq", id, {
        question: faq.question,
        category: faq.category,
      });

      return faq;
    }),

  deleteFAQ: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [faq] = await ctx.db
        .delete(Faq)
        .where(eq(Faq.id, input.id))
        .returning();

      if (!faq) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "FAQ not found",
        });
      }

      await logAuditEvent(ctx, "delete", "faq", input.id, {
        question: faq.question,
        category: faq.category,
      });

      return faq;
    }),

  publishFAQ: adminProcedure
    .input(PublishInputSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData =
        input.publishStatus === "published"
          ? {
              publishStatus: "published" as const,
              publishedAt: new Date(),
              publishedBy: ctx.session.user.id,
            }
          : {
              publishStatus: "draft" as const,
              publishedAt: null,
              publishedBy: null,
            };

      const [faq] = await ctx.db
        .update(Faq)
        .set(updateData)
        .where(eq(Faq.id, input.id))
        .returning();

      if (!faq) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "FAQ not found",
        });
      }

      await logAuditEvent(
        ctx,
        input.publishStatus === "published" ? "approve" : "update",
        "faq",
        input.id,
        {
          question: faq.question,
          action: input.publishStatus,
        },
      );

      return faq;
    }),
} satisfies TRPCRouterRecord;
