import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import {
  AuditLog,
  CreateDocumentSchema,
  Document,
} from "@descope-trust-center/db";

import { protectedProcedure } from "../trpc";
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

export const adminDocumentRouter: TRPCRouterRecord = {
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(Document);
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(Document)
        .where(eq(Document.id, input.id))
        .limit(1);

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result[0];
    }),

  create: adminProcedure
    .input(CreateDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db
        .insert(Document)
        .values({
          ...input,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "create",
        entityType: "document",
        entityId: result[0].id,
        userId,
        userEmail: ctx.session.user.email,
        details: { newValues: input },
      });

      return result[0];
    }),

  update: adminProcedure
    .input(
      CreateDocumentSchema.partial().extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const userId = ctx.session.user.id;

      const oldRecord = await ctx.db
        .select()
        .from(Document)
        .where(eq(Document.id, id))
        .limit(1);

      if (!oldRecord[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingRecord = oldRecord[0];

      const result = await ctx.db
        .update(Document)
        .set({
          ...updateData,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Document.id, id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "update",
        entityType: "document",
        entityId: id,
        userId,
        userEmail: ctx.session.user.email,
        details: {
          oldValues: existingRecord,
          newValues: updateData,
        },
      });

      return result[0];
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const oldRecord = await ctx.db
        .select()
        .from(Document)
        .where(eq(Document.id, input.id))
        .limit(1);

      if (!oldRecord[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const result = await ctx.db
        .delete(Document)
        .where(eq(Document.id, input.id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "delete",
        entityType: "document",
        entityId: input.id,
        userId,
        userEmail: ctx.session.user.email,
        details: { deletedRecord: oldRecord[0] },
      });

      return result[0];
    }),

  publish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db
        .update(Document)
        .set({
          status: "published",
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Document.id, input.id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "publish",
        entityType: "document",
        entityId: input.id,
        userId,
        userEmail: ctx.session.user.email,
      });

      return result[0];
    }),

  unpublish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db
        .update(Document)
        .set({
          status: "draft",
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Document.id, input.id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "unpublish",
        entityType: "document",
        entityId: input.id,
        userId,
        userEmail: ctx.session.user.email,
      });

      return result[0];
    }),
};
