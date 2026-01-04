import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import {
  AuditLog,
  CreateSubprocessorSchema,
  Subprocessor,
} from "@descope-trust-center/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { isAdmin } from "../utils/admin";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdmin(ctx.session.user.email, ctx.session.user.roles)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const adminSubprocessorRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(Subprocessor);
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(Subprocessor)
        .where(eq(Subprocessor.id, input.id))
        .limit(1);

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result[0];
    }),

  create: adminProcedure
    .input(CreateSubprocessorSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db
        .insert(Subprocessor)
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
        entityType: "certification",
        entityId: result[0].id,
        userId,
        userEmail: ctx.session.user.email,
        details: { newValues: input },
      });

      return result[0];
    }),

  update: adminProcedure
    .input(
      CreateSubprocessorSchema.partial().extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const userId = ctx.session.user.id;

      const oldRecord = await ctx.db
        .select()
        .from(Subprocessor)
        .where(eq(Subprocessor.id, id))
        .limit(1);

      if (!oldRecord[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingRecord = oldRecord[0];

      const result = await ctx.db
        .update(Subprocessor)
        .set({
          ...updateData,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Subprocessor.id, id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "update",
        entityType: "certification",
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
        .from(Subprocessor)
        .where(eq(Subprocessor.id, input.id))
        .limit(1);

      if (!oldRecord[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const result = await ctx.db
        .delete(Subprocessor)
        .where(eq(Subprocessor.id, input.id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "delete",
        entityType: "certification",
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
        .update(Subprocessor)
        .set({
          status: "published",
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Subprocessor.id, input.id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "publish",
        entityType: "certification",
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
        .update(Subprocessor)
        .set({
          status: "draft",
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Subprocessor.id, input.id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Audit log
      await ctx.db.insert(AuditLog).values({
        action: "unpublish",
        entityType: "certification",
        entityId: input.id,
        userId,
        userEmail: ctx.session.user.email,
      });

      return result[0];
    }),
});
