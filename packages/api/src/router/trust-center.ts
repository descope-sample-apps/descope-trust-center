import type { TRPCRouterRecord } from "@trpc/server";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod/v4";

import {
  CertificationsSchema,
  DocumentCategorySchema,
  DocumentsSchema,
  FAQCategorySchema,
  FAQsSchema,
  SubprocessorsSchema,
} from "@descope-trust-center/validators";

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
   * For v1: logs to console (no email/database integration)
   */
  submitContactForm: publicProcedure
    .input(ContactFormSchema)
    .mutation(({ input }) => {
      // v1: Log to console - email/database integration to be added later
      console.log("[Trust Center] Contact form submission:", {
        name: input.name,
        email: input.email,
        company: input.company,
        message: input.message,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "Thank you for your inquiry. We will respond within 2 business days.",
      };
    }),

  /**
   * Requests access to an NDA-required document
   * For v1: logs to console (no email/database integration)
   */
  requestDocument: publicProcedure
    .input(DocumentRequestSchema)
    .mutation(({ input }) => {
      // v1: Log to console - email/database integration to be added later
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
        message: "Your document access request has been submitted. Our security team will review and respond within 3 business days.",
      };
    }),
} satisfies TRPCRouterRecord;
