import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
  auditActionEnum,
  AuditLog,
  CreateAuditLogSchema,
  desc,
  eq,
  lt,
  sql,
} from "@descope-trust-center/db";

import { env } from "../env";
import { protectedProcedure, publicProcedure } from "../trpc";
import { isAdmin } from "../utils/admin";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdmin(ctx.session.user.email)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const auditRouter = {
  log: publicProcedure
    .input(CreateAuditLogSchema)
    .mutation(async ({ ctx, input }) => {
      const [log] = await ctx.db.insert(AuditLog).values(input).returning();
      return log;
    }),

  list: adminProcedure
    .input(
      z
        .object({
          action: z.enum(auditActionEnum).optional(),
          entityType: z.string().optional(),
          userId: z.string().optional(),
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      let query = ctx.db.select().from(AuditLog);

      if (input?.action) {
        query = query.where(eq(AuditLog.action, input.action)) as typeof query;
      }
      if (input?.entityType) {
        query = query.where(
          eq(AuditLog.entityType, input.entityType),
        ) as typeof query;
      }
      if (input?.userId) {
        query = query.where(eq(AuditLog.userId, input.userId)) as typeof query;
      }

      const logs = await query
        .orderBy(desc(AuditLog.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(AuditLog);

      const total = Number(countResult?.count ?? 0);

      return {
        logs,
        total,
        hasMore: offset + logs.length < total,
      };
    }),

  getEntityTypes: adminProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ entityType: AuditLog.entityType })
      .from(AuditLog)
      .where(sql`${AuditLog.entityType} IS NOT NULL`);
    return result.map((r) => r.entityType).filter(Boolean) as string[];
  }),

  getStats: adminProcedure
    .input(
      z
        .object({
          days: z.number().min(1).max(365).default(30),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [actionCounts] = await ctx.db
        .select({
          downloads: sql<number>`count(*) filter (where action = 'download')`,
          views: sql<number>`count(*) filter (where action = 'view')`,
          creates: sql<number>`count(*) filter (where action = 'create')`,
          updates: sql<number>`count(*) filter (where action = 'update')`,
          approvals: sql<number>`count(*) filter (where action = 'approve')`,
          denials: sql<number>`count(*) filter (where action = 'deny')`,
        })
        .from(AuditLog);

      return {
        downloads: Number(actionCounts?.downloads ?? 0),
        views: Number(actionCounts?.views ?? 0),
        creates: Number(actionCounts?.creates ?? 0),
        updates: Number(actionCounts?.updates ?? 0),
        approvals: Number(actionCounts?.approvals ?? 0),
        denials: Number(actionCounts?.denials ?? 0),
      };
    }),

  export: adminProcedure
    .input(
      z.object({
        format: z.enum(["json", "csv"]),
        action: z.enum(auditActionEnum).optional(),
        entityType: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(10000).default(1000),
      }),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db.select().from(AuditLog);

      if (input.action) {
        query = query.where(eq(AuditLog.action, input.action)) as typeof query;
      }
      if (input.entityType) {
        query = query.where(
          eq(AuditLog.entityType, input.entityType),
        ) as typeof query;
      }

      const logs = await query
        .orderBy(desc(AuditLog.createdAt))
        .limit(input.limit);

      if (input.format === "csv") {
        const headers = [
          "id",
          "action",
          "entityType",
          "entityId",
          "userId",
          "userEmail",
          "userName",
          "ipAddress",
          "createdAt",
        ];
        const rows = logs.map((log) =>
          [
            log.id,
            log.action,
            log.entityType,
            log.entityId ?? "",
            log.userId ?? "",
            log.userEmail ?? "",
            log.userName ?? "",
            log.ipAddress ?? "",
            log.createdAt.toISOString(),
          ].join(","),
        );
        return { data: [headers.join(","), ...rows].join("\n"), format: "csv" };
      }

      return { data: JSON.stringify(logs, null, 2), format: "json" };
    }),

  clean: adminProcedure
    .input(
      z.object({
        days: z
          .number()
          .min(1)
          .max(365 * 10)
          .default(env.AUDIT_LOG_RETENTION_DAYS),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      const result = await ctx.db
        .delete(AuditLog)
        .where(lt(AuditLog.createdAt, cutoffDate));

      return { deletedCount: result.rowCount };
    }),
} satisfies TRPCRouterRecord;
