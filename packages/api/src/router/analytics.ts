import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  and,
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
  gte,
  lt,
  lte,
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
          dateFrom: z.string().datetime().optional(),
          dateTo: z.string().datetime().optional(),
          searchTerm: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      // Build where conditions
      const whereConditions = [];
      if (input?.type)
        whereConditions.push(eq(FormSubmission.type, input.type));
      if (input?.status)
        whereConditions.push(eq(FormSubmission.status, input.status));
      if (input?.dateFrom)
        whereConditions.push(
          sql`${FormSubmission.createdAt} >= ${input.dateFrom}`,
        );
      if (input?.dateTo)
        whereConditions.push(
          sql`${FormSubmission.createdAt} <= ${input.dateTo}`,
        );
      if (input?.searchTerm) {
        const term = `%${input.searchTerm}%`;
        whereConditions.push(
          sql`(${FormSubmission.email} ILIKE ${term} OR ${FormSubmission.name} ILIKE ${term} OR ${FormSubmission.company} ILIKE ${term})`,
        );
      }

      // Get count with filters
      const countQuery = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(FormSubmission);
      const [countResult] =
        whereConditions.length > 0
          ? await countQuery.where(sql`${sql.join(whereConditions, " AND ")}`)
          : await countQuery;

      // Get submissions with filters
      const submissionsQuery = ctx.db.select().from(FormSubmission);
      const submissions = await (
        whereConditions.length > 0
          ? submissionsQuery.where(sql`${sql.join(whereConditions, " AND ")}`)
          : submissionsQuery
      )
        .orderBy(desc(FormSubmission.createdAt))
        .limit(limit)
        .offset(offset);

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

  getAuditLogs: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
          userEmail: z.string().optional(),
          action: z.string().optional(),
          entityType: z.string().optional(),
          fromDate: z.string().datetime().optional(),
          toDate: z.string().datetime().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const conditions = [];
      if (input?.userEmail)
        conditions.push(eq(AuditLog.userEmail, input.userEmail));
      if (input?.action)
        conditions.push(sql`${AuditLog.action} LIKE ${`%${input.action}%`}`);
      if (input?.entityType)
        conditions.push(
          sql`${AuditLog.entityType} LIKE ${`%${input.entityType}%`}`,
        );
      if (input?.fromDate)
        conditions.push(gte(AuditLog.createdAt, new Date(input.fromDate)));
      if (input?.toDate)
        conditions.push(lte(AuditLog.createdAt, new Date(input.toDate)));

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const logs = await ctx.db
        .select()
        .from(AuditLog)
        .where(whereClause)
        .orderBy(desc(AuditLog.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(AuditLog)
        .where(whereClause);
      const total = Number(countResult?.count ?? 0);

      return {
        logs,
        total,
        hasMore: offset + logs.length < total,
      };
    }),

  exportAuditLogs: adminProcedure
    .input(
      z
        .object({
          format: z.enum(["csv", "json"]).default("csv"),
          userEmail: z.string().optional(),
          action: z.string().optional(),
          entityType: z.string().optional(),
          fromDate: z.string().datetime().optional(),
          toDate: z.string().datetime().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.userEmail)
        conditions.push(eq(AuditLog.userEmail, input.userEmail));
      if (input?.action)
        conditions.push(sql`${AuditLog.action} LIKE ${`%${input.action}%`}`);
      if (input?.entityType)
        conditions.push(
          sql`${AuditLog.entityType} LIKE ${`%${input.entityType}%`}`,
        );
      if (input?.fromDate)
        conditions.push(gte(AuditLog.createdAt, new Date(input.fromDate)));
      if (input?.toDate)
        conditions.push(lte(AuditLog.createdAt, new Date(input.toDate)));

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const logs = await ctx.db
        .select()
        .from(AuditLog)
        .where(whereClause)
        .orderBy(desc(AuditLog.createdAt));

      if (input?.format === "json") {
        return {
          data: logs,
          format: "json",
        };
      }

      // Generate CSV
      const headers = [
        "ID",
        "User Email",
        "Action",
        "Entity Type",
        "Details",
        "IP Address",
        "User Agent",
        "Created At",
      ];

      const csvRows = [
        headers.join(","),
        ...logs.map((log) =>
          [
            log.id,
            log.userEmail ?? "",
            log.action,
            log.entityType ?? "",
            JSON.stringify(log.details ?? {}, null, 0)
              .replace(/\n/g, " ")
              .replace(/"/g, '""'), // Escape quotes and newlines in JSON
            log.ipAddress ?? "",
            (log.userAgent ?? "").replace(/"/g, '""'), // Escape quotes
            log.createdAt.toISOString(),
          ]
            .map((field) => `"${field}"`)
            .join(","),
        ), // Wrap all fields in quotes
      ];

      return {
        data: csvRows.join("\n"),
        format: "csv",
        filename: `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),

  cleanAuditLogs: adminProcedure
    .input(
      z.object({
        daysOld: z.number().min(1).max(3650).default(90), // Default 90 days
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.daysOld);

      const result = await ctx.db
        .delete(AuditLog)
        .where(lt(AuditLog.createdAt, cutoffDate));

      return {
        deletedCount: result.rowCount,
        cutoffDate: cutoffDate.toISOString(),
      };
    }),

  getTopDownloads: adminProcedure.query(async ({ ctx }) => {
    const topDownloads = await ctx.db
      .select({
        documentTitle: DocumentDownload.documentTitle,
        count: sql<number>`count(*)`,
      })
      .from(DocumentDownload)
      .groupBy(DocumentDownload.documentTitle)
      .orderBy(sql`count(*) desc`)
      .limit(5);
    return topDownloads;
  }),

  getFormSummary: adminProcedure.query(async ({ ctx }) => {
    const formSummary = await ctx.db
      .select({
        type: FormSubmission.type,
        count: sql<number>`count(*)`,
      })
      .from(FormSubmission)
      .groupBy(FormSubmission.type)
      .orderBy(sql`count(*) desc`);
    return formSummary;
  }),

  getRecentActivity: adminProcedure.query(async ({ ctx }) => {
    // Get recent downloads and submissions, combine and sort by date
    const [downloads, submissions] = await Promise.all([
      ctx.db
        .select({
          id: DocumentDownload.id,
          type: sql`'download'`,
          title: DocumentDownload.documentTitle,
          user: DocumentDownload.userName,
          email: DocumentDownload.userEmail,
          company: DocumentDownload.company,
          createdAt: DocumentDownload.createdAt,
        })
        .from(DocumentDownload)
        .orderBy(desc(DocumentDownload.createdAt))
        .limit(10),
      ctx.db
        .select({
          id: FormSubmission.id,
          type: FormSubmission.type,
          title: sql`'Form Submission'`,
          user: FormSubmission.name,
          email: FormSubmission.email,
          company: FormSubmission.company,
          createdAt: FormSubmission.createdAt,
        })
        .from(FormSubmission)
        .orderBy(desc(FormSubmission.createdAt))
        .limit(10),
    ]);

    // Combine and sort by createdAt desc
    const activities = [
      ...downloads.map((d) => ({ ...d, type: "download" as const })),
      ...submissions.map((s) => ({ ...s, type: "submission" as const })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    return activities;
  }),

  updateFormSubmissionStatus: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["responded", "closed"]),
        responseNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const adminEmail = ctx.session.user.email ?? "unknown";
      const [updated] = await ctx.db
        .update(FormSubmission)
        .set({
          status: input.status,
          respondedAt: sql`CURRENT_TIMESTAMP`,
          respondedBy: adminEmail,
          responseNotes: input.responseNotes,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(FormSubmission.id, input.id))
        .returning();
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form submission not found",
        });

      await logAuditEvent(ctx, "update", "form_submission", input.id, {
        status: input.status,
        respondedBy: adminEmail,
        responseNotes: input.responseNotes,
      });

      return { success: true, submission: updated };
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

  /**
   * Check if the current user has approved access to a specific document.
   * Used by the document download page to verify access before allowing download.
   */
  checkDocumentAccess: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userEmail = ctx.session.user.email;
      if (!userEmail) {
        return { hasAccess: false, request: null };
      }

      const [request] = await ctx.db
        .select()
        .from(DocumentAccessRequest)
        .where(
          and(
            eq(DocumentAccessRequest.documentId, input.documentId),
            eq(DocumentAccessRequest.email, userEmail),
            eq(DocumentAccessRequest.status, "approved"),
          ),
        )
        .limit(1);

      return {
        hasAccess: !!request,
        request: request ?? null,
      };
    }),

  /**
   * Get all documents the current user has approved access to.
   * Used by the document library to show download buttons for approved NDA docs.
   */
  getMyApprovedDocuments: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.session.user.email;
    if (!userEmail) {
      return [];
    }

    const approvedRequests = await ctx.db
      .select({
        documentId: DocumentAccessRequest.documentId,
        documentTitle: DocumentAccessRequest.documentTitle,
        approvedAt: DocumentAccessRequest.approvedAt,
      })
      .from(DocumentAccessRequest)
      .where(
        and(
          eq(DocumentAccessRequest.email, userEmail),
          eq(DocumentAccessRequest.status, "approved"),
        ),
      );

    return approvedRequests;
  }),
} satisfies TRPCRouterRecord;
