import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import {
  AdminCreateCertificationSchema,
  AuditLog,
  Certification,
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

export const adminCertificationRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    const certifications = await ctx.db.select().from(Certification);
    return certifications.map((cert) => ({
      ...cert,
      name: cert.nameKey,
      description: cert.descriptionKey,
    }));
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(Certification)
        .where(eq(Certification.id, input.id))
        .limit(1);

      if (!result[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const cert = result[0];
      return {
        ...cert,
        name: cert.nameKey,
        description: cert.descriptionKey,
      };
    }),

  create: adminProcedure
    .input(AdminCreateCertificationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.db
        .insert(Certification)
        .values({
          ...input,
          nameKey: input.name,
          descriptionKey: input.description,
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

      return {
        ...result[0],
        name: result[0].nameKey,
        description: result[0].descriptionKey,
      };
    }),

  update: adminProcedure
    .input(
      AdminCreateCertificationSchema.partial().extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, description, ...updateData } = input;
      const userId = ctx.session.user.id;

      const dbUpdateData: Record<string, unknown> = { ...updateData };
      if (name !== undefined) dbUpdateData.nameKey = name;
      if (description !== undefined) dbUpdateData.descriptionKey = description;

      const oldRecord = await ctx.db
        .select()
        .from(Certification)
        .where(eq(Certification.id, id))
        .limit(1);

      if (!oldRecord[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingRecord = oldRecord[0];

      const result = await ctx.db
        .update(Certification)
        .set({
          ...(dbUpdateData as Partial<typeof Certification.$inferInsert>),
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Certification.id, id))
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
          newValues: dbUpdateData,
        },
      });

      return {
        ...result[0],
        name: result[0].nameKey,
        description: result[0].descriptionKey,
      };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const oldRecord = await ctx.db
        .select()
        .from(Certification)
        .where(eq(Certification.id, input.id))
        .limit(1);

      if (!oldRecord[0]) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const result = await ctx.db
        .delete(Certification)
        .where(eq(Certification.id, input.id))
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
        .update(Certification)
        .set({
          status: "published",
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Certification.id, input.id))
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
        .update(Certification)
        .set({
          status: "draft",
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Certification.id, input.id))
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
