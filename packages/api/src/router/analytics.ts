import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  CreateDocumentAccessRequestSchema,
  CreateDocumentDownloadSchema,
  CreateFormSubmissionSchema,
  desc,
  DocumentAccessRequest,
  DocumentDownload,
  eq,
  FormSubmission,
  sql,
} from "@descope-trust-center/db";

import { protectedProcedure, publicProcedure } from "../trpc";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? [];
const ADMIN_DOMAINS = ["descope.com"];

function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  const domain = email.split("@")[1];
  return domain ? ADMIN_DOMAINS.includes(domain) : false;
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdmin(ctx.session.user.email)) {
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
      return download;
    }),

  trackFormSubmission: publicProcedure
    .input(CreateFormSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const [submission] = await ctx.db
        .insert(FormSubmission)
        .values(input)
        .returning();
      return submission;
    }),

  requestDocumentAccess: publicProcedure
    .input(CreateDocumentAccessRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const [request] = await ctx.db
        .insert(DocumentAccessRequest)
        .values(input)
        .returning();
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
          status: z
            .enum(["pending", "approved", "denied", "completed"])
            .optional(),
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
      return { success: true, request: updated };
    }),

  denyAccess: adminProcedure
    .input(
      z.object({ requestId: z.string().uuid(), reason: z.string().min(10) }),
    )
    .mutation(async ({ ctx, input }) => {
      const adminEmail = ctx.session.user.email ?? "unknown";
      const [updated] = await ctx.db
        .update(DocumentAccessRequest)
        .set({
          status: "denied",
          deniedBy: adminEmail,
          deniedAt: sql`CURRENT_TIMESTAMP`,
          denialReason: input.reason,
        })
        .where(eq(DocumentAccessRequest.id, input.requestId))
        .returning();
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Access request not found",
        });
      return { success: true, request: updated };
    }),

  getDashboardSummary: adminProcedure
    .input(
      z
        .object({
          dateRange: z.enum(["7days", "30days", "90days"]).default("30days"),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const dateRange = input?.dateRange ?? "30days";
      const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
      const oneRangeAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const [
        downloadCount,
        downloadsThisMonth,
        downloadsThisWeek,
        formCount,
        formsThisMonth,
        formsThisWeek,
        pendingRequests,
        topDocuments,
        formBreakdown,
        recentActivity,
      ] = await Promise.all([
        ctx.db.select({ count: sql<number>`count(*)` }).from(DocumentDownload),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(DocumentDownload)
          .where(sql`${DocumentDownload.createdAt} >= ${oneRangeAgo}`),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(DocumentDownload)
          // downloadsThisWeek is always last 7 days
          .where(
            sql`${DocumentDownload.createdAt} >= ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)}`,
          ),
        ctx.db.select({ count: sql<number>`count(*)` }).from(FormSubmission),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(FormSubmission)
          .where(sql`${FormSubmission.createdAt} >= ${oneRangeAgo}`),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(FormSubmission)
          .where(
            sql`${FormSubmission.createdAt} >= ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)}`,
          ),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(DocumentAccessRequest)
          .where(eq(DocumentAccessRequest.status, "pending")),
        ctx.db
          .select({
            documentTitle: DocumentDownload.documentTitle,
            downloads: sql<number>`count(*)`,
          })
          .from(DocumentDownload)
          .groupBy(DocumentDownload.documentTitle)
          .orderBy(desc(sql<number>`count(*)`))
          .limit(5),
        ctx.db
          .select({
            type: FormSubmission.type,
            count: sql<number>`count(*)`,
          })
          .from(FormSubmission)
          .groupBy(FormSubmission.type),
        ctx.db
          .select({
            title: DocumentDownload.documentTitle,
            email: DocumentDownload.userEmail,
            createdAt: DocumentDownload.createdAt,
          })
          .from(DocumentDownload)
          .orderBy(desc(DocumentDownload.createdAt))
          .limit(5),
      ]);

      return {
        totalDownloads: Number(downloadCount[0]?.count ?? 0),
        downloadsThisMonth: Number(downloadsThisMonth[0]?.count ?? 0),
        downloadsThisWeek: Number(downloadsThisWeek[0]?.count ?? 0),
        totalFormSubmissions: Number(formCount[0]?.count ?? 0),
        formsThisMonth: Number(formsThisMonth[0]?.count ?? 0),
        formsThisWeek: Number(formsThisWeek[0]?.count ?? 0),
        pendingAccessRequests: Number(pendingRequests[0]?.count ?? 0),
        topDocuments: topDocuments.map((doc) => ({
          title: doc.documentTitle,
          downloads: Number(doc.downloads),
        })),
        formBreakdown: formBreakdown.map((form) => ({
          type: form.type,
          count: Number(form.count),
        })),
        recentActivity: recentActivity.map((activity) => ({
          type: "download",
          title: activity.title,
          email: activity.email,
          createdAt: activity.createdAt,
        })),
      };
    }),
} satisfies TRPCRouterRecord;
