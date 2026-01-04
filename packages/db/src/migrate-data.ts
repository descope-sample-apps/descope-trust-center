import * as fs from "fs";
import * as path from "path";

import { db } from "./client";
import { Certification, Document, Faq, Subprocessor } from "./schema";

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

  const certificationsData = readDataFile<any[]>("certifications.json");
  const documentsData = readDataFile<any[]>("documents.json");
  const faqsData = readDataFile<any[]>("faqs.json");
  const subprocessorsData = readDataFile<any[]>("subprocessors.json");

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
