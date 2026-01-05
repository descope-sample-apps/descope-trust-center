import * as fs from "fs";
import * as path from "path";
import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import {
  Certification as _Certification,
  CreateAuditLogSchema as _CreateAuditLogSchema,
  Document as _Document,
  Faq as _Faq,
  Subprocessor as _Subprocessor,
  AuditLog,
  DocumentAccessRequest,
  FormSubmission,
} from "@descope-trust-center/db";
import {
  DocumentCategorySchema,
  DocumentsSchema,
  FAQCategorySchema,
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
  getCertifications: publicProcedure.query(async ({ ctx }) => {
    const certifications = await ctx.db
      .select()
      .from(_Certification)
      .where(eq(_Certification.status, "published"));
    return certifications.map((cert) => ({
      id: cert.id,
      name: cert.nameKey,
      logo: cert.logo || "",
      status: "active" as const,
      description: cert.descriptionKey,
      standards: cert.standards ?? [],
      lastAuditDate: cert.lastAuditDate
        ? new Date(cert.lastAuditDate).toISOString().split("T")[0]
        : undefined,
      expiryDate: cert.expiryDate
        ? new Date(cert.expiryDate).toISOString().split("T")[0]
        : undefined,
      certificateUrl: cert.certificateUrl,
    }));
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
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db
        .select()
        .from(_Document)
        .where(eq(_Document.status, "published"));

      let filteredDocs = documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        description: doc.description,
        accessLevel: doc.accessLevel,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        updatedAt:
          doc.updatedAt?.toISOString().split("T")[0] ??
          new Date().toISOString().split("T")[0],
        tags: doc.tags ?? [],
      }));

      if (input?.category) {
        filteredDocs = filteredDocs.filter(
          (doc) => doc.category === input.category,
        );
      }

      return filteredDocs;
    }),

  /**
   * Returns all subprocessors
   */
  getSubprocessors: publicProcedure.query(async ({ ctx }) => {
    const subprocessors = await ctx.db
      .select()
      .from(_Subprocessor)
      .where(eq(_Subprocessor.status, "published"));

    return subprocessors.map((sub) => ({
      id: sub.id,
      name: sub.name,
      purpose: sub.purpose,
      dataProcessed: sub.dataProcessed ?? [],
      location: sub.location,
      contractUrl: sub.contractUrl,
      status: "active" as const,
    }));
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
    .query(async ({ ctx, input }) => {
      const faqs = await ctx.db
        .select()
        .from(_Faq)
        .where(eq(_Faq.status, "published"));

      let filteredFaqs = faqs.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      }));

      if (input?.category) {
        filteredFaqs = filteredFaqs.filter(
          (faq) => faq.category === input.category,
        );
      }

      return filteredFaqs;
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
