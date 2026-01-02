import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  and,
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

  getTopDownloadedDocuments: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(10).default(5),
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 5;
      let query = ctx.db
        .select({
          documentTitle: DocumentDownload.documentTitle,
          count: sql<number>`count(*)`,
        })
        .from(DocumentDownload)
        .groupBy(DocumentDownload.documentTitle)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(limit);

      if (input?.startDate) {
        query = query.where(
          sql`${DocumentDownload.createdAt} >= ${input.startDate}`,
        ) as typeof query;
      }
      if (input?.endDate) {
        query = query.where(
          sql`${DocumentDownload.createdAt} <= ${input.endDate}`,
        ) as typeof query;
      }

      return await query;
    }),

  getFormSubmissionsByType: adminProcedure
    .input(
      z
        .object({
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .select({
          type: FormSubmission.type,
          count: sql<number>`count(*)`,
        })
        .from(FormSubmission)
        .groupBy(FormSubmission.type)
        .orderBy(desc(sql<number>`count(*)`));

      if (input?.startDate) {
        query = query.where(
          sql`${FormSubmission.createdAt} >= ${input.startDate}`,
        ) as typeof query;
      }
      if (input?.endDate) {
        query = query.where(
          sql`${FormSubmission.createdAt} <= ${input.endDate}`,
        ) as typeof query;
      }

      return await query;
    }),

  getDashboardSummary: adminProcedure
    .input(
      z
        .object({
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Downloads
      const downloadConditions = [];
      if (input?.startDate)
        downloadConditions.push(
          sql`${DocumentDownload.createdAt} >= ${input.startDate}`,
        );
      if (input?.endDate)
        downloadConditions.push(
          sql`${DocumentDownload.createdAt} <= ${input.endDate}`,
        );
      const downloadQuery = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(DocumentDownload)
        .where(
          downloadConditions.length > 0
            ? and(...downloadConditions)
            : undefined,
        );

      // Form submissions
      const formConditions = [];
      if (input?.startDate)
        formConditions.push(
          sql`${FormSubmission.createdAt} >= ${input.startDate}`,
        );
      if (input?.endDate)
        formConditions.push(
          sql`${FormSubmission.createdAt} <= ${input.endDate}`,
        );
      const formQuery = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(FormSubmission)
        .where(formConditions.length > 0 ? and(...formConditions) : undefined);

      // Pending requests
      const pendingConditions = [eq(DocumentAccessRequest.status, "pending")];
      if (input?.startDate)
        pendingConditions.push(
          sql`${DocumentAccessRequest.createdAt} >= ${input.startDate}`,
        );
      if (input?.endDate)
        pendingConditions.push(
          sql`${DocumentAccessRequest.createdAt} <= ${input.endDate}`,
        );
      const pendingQuery = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(DocumentAccessRequest)
        .where(and(...pendingConditions));

      const [downloadCount, formCount, pendingRequests] = await Promise.all([
        downloadQuery,
        formQuery,
        pendingQuery,
      ]);
      return {
        totalDownloads: Number(downloadCount[0]?.count ?? 0),
        totalFormSubmissions: Number(formCount[0]?.count ?? 0),
        pendingAccessRequests: Number(pendingRequests[0]?.count ?? 0),
      };
    }),
} satisfies TRPCRouterRecord;
