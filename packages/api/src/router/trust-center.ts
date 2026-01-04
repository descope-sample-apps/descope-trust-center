import * as fs from "fs";
import * as path from "path";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import {
  CreateAuditLogSchema as _CreateAuditLogSchema,
  AuditLog,
  Certification,
  Document,
  DocumentAccessRequest,
  Faq,
  FormSubmission,
  Subprocessor,
} from "@descope-trust-center/db";
import {
  CertificationsSchema,
  DocumentCategorySchema,
  DocumentsSchema,
  FAQCategorySchema,
  FAQsSchema,
  SubprocessorsSchema,
  SubprocessorSubscriptionSchema,
} from "@descope-trust-center/validators";

import { env } from "../env";
import { createEmailService } from "../lib/email";
import { protectedProcedure, publicProcedure } from "../trpc";

// Create email service instance
const emailService = createEmailService({
  apiKey: env.RESEND_API_KEY,
  fromEmail:
    env.TRUST_CENTER_FROM_EMAIL ?? "Trust Center <noreply@descope.com>",
  notificationEmail:
    env.TRUST_CENTER_NOTIFICATION_EMAIL ?? "security@descope.com",
});

/**
 * Reads and parses a JSON data file from the Next.js app data directory
 */
function readDataFile<T>(filename: string): T {
  const dataPath = path.resolve(
    process.cwd(),
    "apps/nextjs/src/app/data",
    filename,
  );
  const content = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(content) as T;
}

/**
 * Contact form submission schema
 */
const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Valid email is required"),
  company: z.string().min(1, "Company is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

/**
 * Document request schema for NDA-required documents
 */
const DocumentRequestSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Valid email is required"),
  company: z.string().min(1, "Company is required"),
  reason: z.string().min(10, "Please provide a reason for access"),
});

/**
 * Trust Center tRPC router
 *
 * Provides endpoints for:
 * - Querying certifications, documents, subprocessors, and FAQs
 * - Submitting contact forms and document access requests
 */
export const trustCenterRouter = {
  // ==================== Query Endpoints ====================

  /**
   * Returns all certifications
   */
  getCertifications: publicProcedure.query(() => {
    const data = readDataFile<unknown[]>("certifications.json");
    return CertificationsSchema.parse(data);
  }),

  /**
   * Returns all documents, optionally filtered by category
   */
  getDocuments: publicProcedure
    .input(
      z
        .object({
          category: DocumentCategorySchema.optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const data = readDataFile<unknown[]>("documents.json");
      const documents = DocumentsSchema.parse(data);

      if (input?.category) {
        return documents.filter((doc) => doc.category === input.category);
      }

      return documents;
    }),

  /**
   * Returns all subprocessors
   */
  getSubprocessors: publicProcedure.query(() => {
    const data = readDataFile<unknown[]>("subprocessors.json");
    return SubprocessorsSchema.parse(data);
  }),

  /**
   * Returns all FAQs, optionally filtered by category
   */
  getFAQs: publicProcedure
    .input(
      z
        .object({
          category: FAQCategorySchema.optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      const data = readDataFile<unknown[]>("faqs.json");
      const faqs = FAQsSchema.parse(data);

      if (input?.category) {
        return faqs.filter((faq) => faq.category === input.category);
      }

      return faqs;
    }),

  // ==================== Mutation Endpoints ====================

  /**
   * Submits a security inquiry contact form
   * Sends confirmation email to user and notification to internal team
   */
  submitContactForm: publicProcedure
    .input(ContactFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Log audit event
      await ctx.db.insert(AuditLog).values({
        action: "create",
        entityType: "form_submission",
        entityId: undefined, // Will be set after insertion if needed
        userEmail: input.email,
        userName: input.name,
        details: {
          type: "contact",
          company: input.company,
          message: input.message,
        },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });

      // Also save to form_submissions table for admin review
      await ctx.db.insert(FormSubmission).values({
        type: "contact",
        email: input.email,
        name: input.name,
        company: input.company,
        metadata: { message: input.message },
        ipAddress: ctx.ipAddress,
      });

      // Send notification email to internal team
      if (emailService) {
        try {
          await emailService.sendContactFormNotification({
            name: input.name,
            email: input.email,
            company: input.company,
            message: input.message,
          });
        } catch (error) {
          console.error(
            "[Trust Center] Failed to send contact form notification:",
            error,
          );
          // Continue with success response even if email fails
          // TODO: Consider implementing retry mechanism or alerting
        }
      }

      return {
        success: true,
        message:
          "Thank you for your inquiry. We will respond within 2 business days.",
      };
    }),

  /**
   * Requests access to an NDA-required document
   * Sends confirmation email to user and notification to internal team
   */
  requestDocument: publicProcedure
    .input(DocumentRequestSchema)
    .mutation(async ({ ctx, input }) => {
      // Log audit event
      await ctx.db.insert(AuditLog).values({
        action: "create",
        entityType: "document_access_request",
        entityId: input.documentId,
        userEmail: input.email,
        userName: input.name,
        details: {
          company: input.company,
          reason: input.reason,
        },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });

      // Fetch document title for the request
      const documents = DocumentsSchema.parse(
        readDataFile<unknown[]>("documents.json"),
      );
      const document = documents.find((doc) => doc.id === input.documentId);

      // Also save to document_access_request table for admin review
      await ctx.db.insert(DocumentAccessRequest).values({
        documentId: input.documentId,
        documentTitle: document?.title ?? "Unknown Document",
        name: input.name,
        email: input.email,
        company: input.company,
        reason: input.reason,
        ipAddress: ctx.ipAddress,
      });

      // Send confirmation email to user
      if (emailService) {
        try {
          await emailService.sendDocumentRequestConfirmation({
            name: input.name,
            email: input.email,
            company: input.company,
            documentId: input.documentId,
            reason: input.reason,
          });
        } catch (error) {
          console.error(
            "[Trust Center] Failed to send document request confirmation:",
            error,
          );
          // Continue with success response even if email fails
          // TODO: Consider implementing retry mechanism or alerting
        }
      }

      return {
        success: true,
        message:
          "Your document access request has been submitted. Our security team will review and respond within 3 business days.",
      };
    }),

  subscribeToSubprocessorUpdates: publicProcedure
    .input(SubprocessorSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      // Log audit event
      await ctx.db.insert(AuditLog).values({
        action: "create",
        entityType: "form_submission",
        userEmail: input.email,
        details: {
          type: "subprocessor_subscription",
        },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });

      // Also save to form_submissions table
      await ctx.db.insert(FormSubmission).values({
        type: "subprocessor_subscription",
        email: input.email,
        metadata: {},
        ipAddress: ctx.ipAddress,
      });

      // Send confirmation email to subscriber
      if (emailService) {
        try {
          await emailService.sendSubprocessorSubscriptionConfirmation({
            email: input.email,
          });
        } catch (error) {
          console.error(
            "[Trust Center] Failed to send subscription confirmation:",
            error,
          );
          // Continue with success response even if email fails
          // TODO: Consider implementing retry mechanism or alerting
        }
      }

      return {
        success: true,
        message:
          "You're subscribed! We'll notify you when our subprocessor list changes.",
      };
    }),

  /**
   * Returns current status page information
   */
  getStatusPage: publicProcedure.query(async () => {
    const statusPageUrl = process.env.STATUS_PAGE_URL;

    if (!statusPageUrl) {
      return {
        page: {
          name: "Descope",
          url: "https://status.descope.com",
          status: "UP" as const,
        },
        activeIncidents: [],
        activeMaintenances: [],
      };
    }

    try {
      const response = await fetch(`${statusPageUrl}/summary.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch status page:", error);
      return {
        page: {
          name: "Descope",
          url: statusPageUrl,
          status: "UNKNOWN" as const,
        },
        activeIncidents: [],
        activeMaintenances: [],
      };
    }
  }),

  // ==================== Admin Mutations ====================

  /**
   * Approves a document access request (placeholder - requires admin auth)
   * TODO: Send approval notification email to user
   */
  approveDocumentRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        documentId: z.string(),
        userEmail: z.string(),
        userName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("[Trust Center] Document request approved:", {
        requestId: input.requestId,
        documentId: input.documentId,
        userEmail: input.userEmail,
        timestamp: new Date().toISOString(),
      });

      // Send approval notification email to user
      if (emailService) {
        try {
          await emailService.sendDocumentAccessApproval({
            email: input.userEmail,
            name: input.userName,
            documentId: input.documentId,
          });
        } catch (error) {
          console.error(
            "[Trust Center] Failed to send document approval notification:",
            error,
          );
          // Continue with success response even if email fails
          // TODO: Consider implementing retry mechanism or alerting
        }
      }

      return {
        success: true,
        message: "Document access request approved.",
      };
    }),

  /**
   * Denies a document access request (placeholder - requires admin auth)
   * TODO: Send denial notification email to user
   */
  denyDocumentRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        documentId: z.string(),
        userEmail: z.string(),
        userName: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("[Trust Center] Document request denied:", {
        requestId: input.requestId,
        documentId: input.documentId,
        userEmail: input.userEmail,
        reason: input.reason,
        timestamp: new Date().toISOString(),
      });

      // Send denial notification email to user
      if (emailService) {
        try {
          await emailService.sendDocumentAccessDenial({
            email: input.userEmail,
            name: input.userName,
            documentId: input.documentId,
            reason: input.reason,
          });
        } catch (error) {
          console.error(
            "[Trust Center] Failed to send document denial notification:",
            error,
          );
          // Continue with success response even if email fails
          // TODO: Consider implementing retry mechanism or alerting
        }
      }

      return {
        success: true,
        message: "Document access request denied.",
      };
    }),
} satisfies TRPCRouterRecord;
