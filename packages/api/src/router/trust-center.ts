import * as fs from "fs";
import * as path from "path";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import {
  CertificationsSchema,
  DocumentCategorySchema,
  DocumentsSchema,
  FAQCategorySchema,
  FAQsSchema,
  SubprocessorsSchema,
  SubprocessorSubscriptionSchema,
} from "@descope-trust-center/validators";

import { emailTemplates, sendEmail } from "../email";
import { publicProcedure } from "../trpc";

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
    .mutation(async ({ input }) => {
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

      console.log("[Trust Center] Contact form submission:", {
        name: input.name,
        email: input.email,
        company: input.company,
        message: input.message,
        timestamp: new Date().toISOString(),
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
    .mutation(async ({ input }) => {
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

      console.log("[Trust Center] Document access request:", {
        documentId: input.documentId,
        name: input.name,
        email: input.email,
        company: input.company,
        reason: input.reason,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message:
          "Your document access request has been submitted. Our security team will review and respond within 3 business days.",
      };
    }),

  subscribeToSubprocessorUpdates: publicProcedure
    .input(SubprocessorSubscriptionSchema)
    .mutation(async ({ input }) => {
      // Send confirmation email to user
      const confirmationTemplate =
        emailTemplates.subprocessorSubscriptionConfirmation(input.email);
      await sendEmail({
        to: input.email,
        subject: confirmationTemplate.subject,
        html: confirmationTemplate.html,
        text: confirmationTemplate.text,
      });

      console.log("[Trust Center] Subprocessor subscription:", {
        email: input.email,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message:
          "You're subscribed! We'll notify you when our subprocessor list changes.",
      };
    }),
} satisfies TRPCRouterRecord;
