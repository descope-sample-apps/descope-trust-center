import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
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
  DocumentCategorySchema,
  FAQCategorySchema,
  SubprocessorSubscriptionSchema,
} from "@descope-trust-center/validators";

import { emailTemplates, sendEmail } from "../email";
import { env } from "../env";
import { publicProcedure } from "../trpc";

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
   * Returns all published certifications
   */
  getCertifications: publicProcedure.query(async ({ ctx }) => {
    const certifications = await ctx.db
      .select()
      .from(Certification)
      .where(eq(Certification.publishStatus, "published"));

    // Transform to match existing schema
    return certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      logo: cert.logo,
      status: cert.status,
      lastAuditDate: cert.lastAuditDate,
      expiryDate: cert.expiryDate,
      certificateUrl: cert.certificateUrl,
      description: cert.description,
      standards: cert.standards,
    }));
  }),

  /**
   * Returns all published documents, optionally filtered by category
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
        .from(Document)
        .where(
          input?.category
            ? and(
                eq(Document.publishStatus, "published"),
                eq(Document.category, input.category),
              )
            : eq(Document.publishStatus, "published"),
        );

      // Transform to match existing schema
      return documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        description: doc.description,
        accessLevel: doc.accessLevel,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        updatedAt: doc.updatedAt?.toISOString(),
        tags: doc.tags,
      }));
    }),

  /**
   * Returns all published subprocessors
   */
  getSubprocessors: publicProcedure.query(async ({ ctx }) => {
    const subprocessors = await ctx.db
      .select()
      .from(Subprocessor)
      .where(eq(Subprocessor.publishStatus, "published"));

    // Transform to match existing schema
    return subprocessors.map((sub) => ({
      id: sub.id,
      name: sub.name,
      purpose: sub.purpose,
      dataProcessed: sub.dataProcessed,
      location: sub.location,
      contractUrl: sub.contractUrl,
      status: sub.status,
    }));
  }),

  /**
   * Returns all published FAQs, optionally filtered by category
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
        .from(Faq)
        .where(
          input?.category
            ? and(
                eq(Faq.publishStatus, "published"),
                eq(Faq.category, input.category),
              )
            : eq(Faq.publishStatus, "published"),
        );

      // Transform to match existing schema
      return faqs.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      }));
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

      // Send confirmation email to user
      const userEmailTemplate = emailTemplates.contactFormConfirmation(
        input.name,
      );
      await sendEmail({
        to: input.email,
        subject: userEmailTemplate.subject,
        html: userEmailTemplate.html,
        text: userEmailTemplate.text,
      });

      // Send notification email to internal team
      const internalEmailTemplate = emailTemplates.contactFormNotification({
        name: input.name,
        email: input.email,
        company: input.company,
        message: input.message,
      });
      await sendEmail({
        to: "security@descope.com", // Internal email address
        subject: internalEmailTemplate.subject,
        html: internalEmailTemplate.html,
        text: internalEmailTemplate.text,
      });

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

      // Also save to document_access_request table for admin review
      // Fetch document title from database
      const [document] = await ctx.db
        .select({ title: Document.title })
        .from(Document)
        .where(eq(Document.id, input.documentId))
        .limit(1);

      await ctx.db.insert(DocumentAccessRequest).values({
        documentId: input.documentId,
        documentTitle: document?.title ?? input.documentId,
        email: input.email,
        name: input.name,
        company: input.company,
        reason: input.reason,
        ipAddress: ctx.ipAddress,
      });

      // Send confirmation email to user
      const userEmailTemplate = emailTemplates.documentRequestConfirmation({
        name: input.name,
        email: input.email,
        company: input.company,
        reason: input.reason,
      });
      await sendEmail({
        to: input.email,
        subject: userEmailTemplate.subject,
        html: userEmailTemplate.html,
        text: userEmailTemplate.text,
      });

      // Send notification email to internal team
      const internalEmailTemplate = emailTemplates.documentRequestNotification({
        name: input.name,
        email: input.email,
        company: input.company,
        reason: input.reason,
        documentId: input.documentId,
      });
      await sendEmail({
        to: "security@descope.com", // Internal email address
        subject: internalEmailTemplate.subject,
        html: internalEmailTemplate.html,
        text: internalEmailTemplate.text,
      });

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

      // Send confirmation email to user
      const confirmationTemplate =
        emailTemplates.subprocessorSubscriptionConfirmation(input.email);
      await sendEmail({
        to: input.email,
        subject: confirmationTemplate.subject,
        html: confirmationTemplate.html,
        text: confirmationTemplate.text,
      });

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
    const statusPageUrl = env.STATUS_PAGE_URL;

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
} satisfies TRPCRouterRecord;
