import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  AuditLog,
  CreateDocumentAccessRequestSchema,
  CreateDocumentDownloadSchema,
  CreateFormSubmissionSchema,
  desc,
  Document,
  DocumentAccessRequest,
  DocumentDownload,
  eq,
  FormSubmission,
  sql,
} from "@descope-trust-center/db";

import { emailTemplates, sendEmail } from "../email";
import { protectedProcedure, publicProcedure } from "../trpc";
import { isAdmin, logAuditEvent } from "../utils/admin";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdmin(ctx.session.user.email, ctx.session.user.roles)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const analyticsRouter = {
  trackDownload: publicProcedure
    .input(CreateDocumentDownloadSchema)
    .mutation(async ({ ctx, input }) => {
      const [download] = await ctx.db
        .insert(DocumentDownload)
        .values(input)
        .returning();

      await logAuditEvent(
        ctx,
        "download",
        "document_download",
        input.documentId,
        {
          documentTitle: input.documentTitle,
          userEmail: input.userEmail,
          userName: input.userName,
          company: input.company,
        },
      );

      return download;
    }),

  trackFormSubmission: publicProcedure
    .input(CreateFormSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const [submission] = await ctx.db
        .insert(FormSubmission)
        .values(input)
        .returning();

      await logAuditEvent(ctx, "create", "form_submission", input.type, {
        email: input.email,
        name: input.name,
        company: input.company,
        status: input.status,
      });

      return submission;
    }),

  requestDocumentAccess: publicProcedure
    .input(CreateDocumentAccessRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .insert(DocumentAccessRequest)
        .values(input)
        .returning();

      await logAuditEvent(
        ctx,
        "create",
        "document_access_request",
        input.documentId,
        {
          documentTitle: input.documentTitle,
          email: input.email,
          name: input.name,
          company: input.company,
          reason: input.reason,
        },
      );

      return {
        id: request?.id,
        message:
          "Access request submitted. We'll respond within 3 business days.",
      };
    }),

  getDownloadStats: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const [downloads, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(DocumentDownload)
          .orderBy(desc(DocumentDownload.createdAt))
          .limit(limit)
          .offset(offset),
        ctx.db.select({ count: sql<number>`count(*)` }).from(DocumentDownload),
      ]);
      const total = Number(countResult[0]?.count ?? 0);
      return {
        downloads,
        total,
        hasMore: offset + downloads.length < total,
      };
    }),

  getFormStats: adminProcedure
    .input(
      z
        .object({
          type: z
            .enum(["contact", "document_request", "subprocessor_subscription"])
            .optional(),
          status: z.enum(["new", "responded", "closed"]).optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      let query = ctx.db.select().from(FormSubmission);
      if (input?.type)
        query = query.where(
          eq(FormSubmission.type, input.type),
        ) as typeof query;
      if (input?.status)
        query = query.where(
          eq(FormSubmission.status, input.status),
        ) as typeof query;
      const submissions = await query
        .orderBy(desc(FormSubmission.createdAt))
        .limit(limit)
        .offset(offset);
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(FormSubmission);
      const total = Number(countResult?.count ?? 0);
      return {
        submissions,
        total,
        hasMore: offset + submissions.length < total,
      };
    }),

  getAccessRequests: adminProcedure
    .input(
      z
        .object({
          status: z.enum(["pending", "approved", "denied"]).optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      let query = ctx.db.select().from(DocumentAccessRequest);
      if (input?.status)
        query = query.where(
          eq(DocumentAccessRequest.status, input.status),
        ) as typeof query;
      const requests = await query
        .orderBy(desc(DocumentAccessRequest.createdAt))
        .limit(limit)
        .offset(offset);
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(DocumentAccessRequest);
      const total = Number(countResult?.count ?? 0);
      return {
        requests,
        total,
        hasMore: offset + requests.length < total,
      };
    }),

  approveAccess: adminProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminEmail = ctx.session.user.email ?? "unknown";
      const [updated] = await ctx.db
        .update(DocumentAccessRequest)
        .set({
          status: "approved",
          approvedBy: adminEmail,
          // Use sql template to bypass drizzle's mapToDriverValue which fails with Date across module boundaries
          approvedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(DocumentAccessRequest.id, input.requestId))
        .returning();
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Access request not found",
        });

      await logAuditEvent(
        ctx,
        "approve",
        "document_access_request",
        input.requestId,
        {
          approvedBy: adminEmail,
          documentId: updated.documentId,
          documentTitle: updated.documentTitle,
          email: updated.email,
          name: updated.name,
          company: updated.company,
        },
      );

      // Send approval email to requester
      const approvalTemplate = emailTemplates.documentRequestApproved({
        name: updated.name,
        email: updated.email,
        documentName: updated.documentTitle,
        downloadLink:
          "https://descope.com/trust-center/documents/" + updated.documentId, // Placeholder link
      });
      await sendEmail({
        to: updated.email,
        subject: approvalTemplate.subject,
        html: approvalTemplate.html,
        text: approvalTemplate.text,
      });

      return { success: true, request: updated };
    }),

  denyAccess: adminProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const adminEmail = ctx.session.user.email ?? "unknown";
      const [updated] = await ctx.db
        .update(DocumentAccessRequest)
        .set({
          status: "denied",
          deniedBy: adminEmail,
          denialReason: input.reason,
          // Use sql template to bypass drizzle's mapToDriverValue which fails with Date across module boundaries
          deniedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(DocumentAccessRequest.id, input.requestId))
        .returning();
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Access request not found",
        });

      await logAuditEvent(
        ctx,
        "deny",
        "document_access_request",
        input.requestId,
        {
          deniedBy: adminEmail,
          denialReason: input.reason,
          documentId: updated.documentId,
          documentTitle: updated.documentTitle,
          email: updated.email,
          name: updated.name,
          company: updated.company,
        },
      );

      // Send denial email to requester
      const denialTemplate = emailTemplates.documentRequestDenied({
        name: updated.name,
        email: updated.email,
        documentName: updated.documentTitle,
        reason: input.reason,
      });
      await sendEmail({
        to: updated.email,
        subject: denialTemplate.subject,
        html: denialTemplate.html,
        text: denialTemplate.text,
      });

      return { success: true, request: updated };
    }),

  getDashboardSummary: adminProcedure.query(async ({ ctx }) => {
    const [downloadCount, formCount, pendingRequests, auditCount] =
      await Promise.all([
        ctx.db.select({ count: sql<number>`count(*)` }).from(DocumentDownload),
        ctx.db.select({ count: sql<number>`count(*)` }).from(FormSubmission),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(DocumentAccessRequest)
          .where(eq(DocumentAccessRequest.status, "pending")),
        ctx.db.select({ count: sql<number>`count(*)` }).from(AuditLog),
      ]);
    return {
      totalDownloads: Number(downloadCount[0]?.count ?? 0),
      totalFormSubmissions: Number(formCount[0]?.count ?? 0),
      pendingAccessRequests: Number(pendingRequests[0]?.count ?? 0),
      totalAuditLogs: Number(auditCount[0]?.count ?? 0),
    };
  }),

  getDocumentDownloadAnalytics: adminProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .select({
        documentId: Document.id,
        documentTitle: Document.title,
        category: Document.category,
        accessLevel: Document.accessLevel,
        totalDownloads: sql<number>`count(${DocumentDownload.id})`,
        downloadsThisMonth: sql<number>`count(case when ${DocumentDownload.createdAt} >= date_trunc('month', current_date) then ${DocumentDownload.id} end)`,
        downloadsThisWeek: sql<number>`count(case when ${DocumentDownload.createdAt} >= date_trunc('week', current_date) then ${DocumentDownload.id} end)`,
        lastDownloadAt: sql<Date>`max(${DocumentDownload.createdAt})`,
        lastDownloadUser: sql<string>`(array_agg(${DocumentDownload.userName} order by ${DocumentDownload.createdAt} desc))[1]`,
        lastDownloadCompany: sql<string>`(array_agg(${DocumentDownload.company} order by ${DocumentDownload.createdAt} desc))[1]`,
      })
      .from(Document)
      .innerJoin(DocumentDownload, eq(Document.id, DocumentDownload.documentId))
      .groupBy(
        Document.id,
        Document.title,
        Document.category,
        Document.accessLevel,
      )
      .orderBy(sql`count(${DocumentDownload.id}) desc`);

    return results.map((row) => ({
      documentId: row.documentId,
      documentTitle: row.documentTitle,
      category: row.category,
      accessLevel: row.accessLevel,
      totalDownloads: row.totalDownloads,
      downloadsThisMonth: row.downloadsThisMonth,
      downloadsThisWeek: row.downloadsThisWeek,
      lastDownloadAt: row.lastDownloadAt,
      lastDownloadUser: row.lastDownloadUser,
      lastDownloadCompany: row.lastDownloadCompany,
    }));
  }),

  getDownloadHistory: adminProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(DocumentDownload)
        .where(eq(DocumentDownload.documentId, input.documentId))
        .orderBy(desc(DocumentDownload.createdAt));
    }),
} satisfies TRPCRouterRecord;
