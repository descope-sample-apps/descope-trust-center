import type { TRPCRouterRecord } from "@trpc/server";
import type { VercelPgDatabase } from "drizzle-orm/vercel-postgres";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  and,
  AuditLog,
  CreateDocumentAccessRequestSchema,
  CreateDocumentDownloadSchema,
  CreateFormSubmissionSchema,
  desc,
  DocumentAccessRequest,
  DocumentDownload,
  eq,
  FormSubmission,
  gte,
  like,
  lte,
  sql,
} from "@descope-trust-center/db";
import * as schema from "@descope-trust-center/db/schema";

import type { Context, DescopeSession } from "../trpc";
import { protectedProcedure, publicProcedure } from "../trpc";

type Database = VercelPgDatabase<typeof schema>;

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? [];
const ADMIN_DOMAINS = ["descope.com"];

function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  const domain = email.split("@")[1];
  return domain ? ADMIN_DOMAINS.includes(domain) : false;
}

async function logAuditEvent(
  ctx: Context,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await ctx.db.insert(AuditLog).values({
      action,
      entityType,
      entityId,
      userId: ctx.session?.user.id,
      userEmail: ctx.session?.user.email,
      userName: ctx.session?.user.name,
      metadata,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  } catch (error) {
    // Audit logging should not block business operations
    // Log the error for monitoring but don't throw
    console.error("Failed to log audit event:", error);
  }
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

      return { success: true, request: updated };
    }),

  getAuditLogs: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
          userId: z.string().optional(),
          action: z.string().optional(),
          resource: z.string().optional(),
          fromDate: z.string().datetime().optional(),
          toDate: z.string().datetime().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const conditions = [];
      if (input?.userId) conditions.push(eq(AuditLog.userId, input.userId));
      if (input?.action)
        conditions.push(like(AuditLog.action, `%${input.action}%`));
      if (input?.resource)
        conditions.push(like(AuditLog.entityId, `%${input.resource}%`));
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
} satisfies TRPCRouterRecord;
