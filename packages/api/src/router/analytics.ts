import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";

import {
  CreateDocumentAccessRequestSchema,
  CreateDocumentDownloadSchema,
  CreateFormSubmissionSchema,
  DocumentAccessRequest,
  DocumentDownload,
  FormSubmission,
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
      return {
        downloads,
        total: countResult[0]?.count ?? 0,
        hasMore: offset + downloads.length < (countResult[0]?.count ?? 0),
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
      return {
        submissions,
        total: countResult?.count ?? 0,
        hasMore: offset + submissions.length < (countResult?.count ?? 0),
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
      return {
        requests,
        total: countResult?.count ?? 0,
        hasMore: offset + requests.length < (countResult?.count ?? 0),
      };
    }),

  approveAccess: adminProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminEmail = ctx.session.user.email || "unknown";
      const [updated] = await ctx.db
        .update(DocumentAccessRequest)
        .set({
          status: "approved",
          approvedBy: adminEmail,
          approvedAt: new Date(),
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
      const adminEmail = ctx.session.user.email || "unknown";
      const [updated] = await ctx.db
        .update(DocumentAccessRequest)
        .set({
          status: "denied",
          deniedBy: adminEmail,
          deniedAt: new Date(),
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

  getDashboardSummary: adminProcedure.query(async ({ ctx }) => {
    const [downloadCount, formCount, pendingRequests] = await Promise.all([
      ctx.db.select({ count: sql<number>`count(*)` }).from(DocumentDownload),
      ctx.db.select({ count: sql<number>`count(*)` }).from(FormSubmission),
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(DocumentAccessRequest)
        .where(eq(DocumentAccessRequest.status, "pending")),
    ]);
    return {
      totalDownloads: downloadCount[0]?.count ?? 0,
      totalFormSubmissions: formCount[0]?.count ?? 0,
      pendingAccessRequests: pendingRequests[0]?.count ?? 0,
    };
  }),
} satisfies TRPCRouterRecord;
