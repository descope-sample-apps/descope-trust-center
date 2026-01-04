import * as fs from "fs";
import * as path from "path";

import { db } from "./client";
import { Certification, Document, Faq, Subprocessor } from "./schema";

interface CertificationData {
  id: string;
  name: string;
  logo: string;
  status: string;
  lastAuditDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
  description: string;
  standards: string[];
}

interface DocumentData {
  id: string;
  title: string;
  category: string;
  description: string;
  accessLevel: string;
  fileUrl?: string;
  fileSize?: string;
  updatedAt: string;
  tags: string[];
}

interface SubprocessorData {
  id: string;
  name: string;
  purpose: string;
  dataProcessed: string[];
  location: string;
  contractUrl: string;
  status: string;
}

interface FaqData {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/**
 * Reads and parses a JSON data file from the Next.js app data directory
 */
function readDataFile<T>(filename: string): T {
  const dataPath = path.resolve(
    new URL(import.meta.url).pathname,
    "../../../../apps/nextjs/src/app/data",
    filename,
  );
  const content = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(content) as T;
}

async function migrateData() {
  console.log("Starting data migration...");

  const certificationsData = readDataFile<CertificationData[]>(
    "certifications.json",
  );
  const documentsData = readDataFile<DocumentData[]>("documents.json");
  const faqsData = readDataFile<FaqData[]>("faqs.json");
  const subprocessorsData =
    readDataFile<SubprocessorData[]>("subprocessors.json");

  // Migrate certifications
  for (const cert of certificationsData) {
    await db.insert(Certification).values([
      {
        id: cert.id,
        name: cert.name,
        logo: cert.logo,
        status: cert.status,
        lastAuditDate: cert.lastAuditDate,
        expiryDate: cert.expiryDate,
        certificateUrl: cert.certificateUrl,
        description: cert.description,
        standards: cert.standards,
      },
    ]);
  }

  // Migrate documents
  console.log("Migrating documents...");
  for (const doc of documentsData) {
    await db.insert(Document).values({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      description: doc.description,
      accessLevel: doc.accessLevel,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      updatedAt: new Date(doc.updatedAt),
      tags: doc.tags,
    });
  }

  // Migrate subprocessors
  console.log("Migrating subprocessors...");
  for (const sub of subprocessorsData) {
    await db.insert(Subprocessor).values({
      id: sub.id,
      name: sub.name,
      purpose: sub.purpose,
      dataProcessed: sub.dataProcessed,
      location: sub.location,
      contractUrl: sub.contractUrl,
      status: sub.status,
    });
  }

  // Migrate FAQs
  console.log("Migrating FAQs...");
  for (const faq of faqsData) {
    await db.insert(Faq).values({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
  }

  console.log("Data migration completed!");
}

migrateData().catch(console.error);
