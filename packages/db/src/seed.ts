import { readFileSync } from "fs";
import { join } from "path";

import { db } from "./client";
import { Certification, Document, FAQ, Subprocessor } from "./schema";

interface CertificationJson {
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

interface DocumentJson {
  id: string;
  title: string;
  category: string;
  description: string;
  accessLevel: string;
  fileUrl?: string;
  fileSize?: string;
  updatedAt?: string;
  tags: string[];
}

interface SubprocessorJson {
  id: string;
  name: string;
  purpose: string;
  dataProcessed: string[];
  location: string;
  contractUrl?: string;
  status: string;
}

interface FAQJson {
  id: string;
  question: string;
  answer: string;
  category: string;
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  const dataPath = join(__dirname, "../../../apps/nextjs/src/app/data");

  console.log("📜 Seeding certifications...");
  const certificationsRaw = readFileSync(
    join(dataPath, "certifications.json"),
    "utf-8",
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const certifications: CertificationJson[] = JSON.parse(certificationsRaw);

  for (const [index, cert] of certifications.entries()) {
    await db.insert(Certification).values({
      name: cert.name,
      slug: cert.id,
      logo: cert.logo,
      status: cert.status,
      lastAuditDate: cert.lastAuditDate,
      expiryDate: cert.expiryDate,
      certificateUrl: cert.certificateUrl,
      description: cert.description,
      standards: cert.standards,
      sortOrder: index,
      isPublished: true,
    });
    console.log(`  ✓ ${cert.name}`);
  }

  console.log("\n📄 Seeding documents...");
  const documentsRaw = readFileSync(join(dataPath, "documents.json"), "utf-8");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const documents: DocumentJson[] = JSON.parse(documentsRaw);

  for (const [index, doc] of documents.entries()) {
    await db.insert(Document).values({
      title: doc.title,
      slug: doc.id,
      category: doc.category,
      description: doc.description,
      accessLevel: doc.accessLevel,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      tags: doc.tags,
      sortOrder: index,
      isPublished: true,
    });
    console.log(`  ✓ ${doc.title}`);
  }

  console.log("\n🏢 Seeding subprocessors...");
  const subprocessorsRaw = readFileSync(
    join(dataPath, "subprocessors.json"),
    "utf-8",
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const subprocessors: SubprocessorJson[] = JSON.parse(subprocessorsRaw);

  for (const [index, sub] of subprocessors.entries()) {
    await db.insert(Subprocessor).values({
      name: sub.name,
      slug: sub.id,
      purpose: sub.purpose,
      dataProcessed: sub.dataProcessed,
      location: sub.location,
      contractUrl: sub.contractUrl,
      status: sub.status,
      sortOrder: index,
      isPublished: true,
    });
    console.log(`  ✓ ${sub.name}`);
  }

  console.log("\n❓ Seeding FAQs...");
  const faqsRaw = readFileSync(join(dataPath, "faqs.json"), "utf-8");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const faqs: FAQJson[] = JSON.parse(faqsRaw);

  const faqValues = faqs.map((faq, index) => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    sortOrder: index,
    isPublished: true,
  }));

  await db.insert(FAQ).values(faqValues);

  for (const faq of faqs) {
    console.log(`  ✓ ${faq.question.slice(0, 50)}...`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`   - ${certifications.length} certifications`);
  console.log(`   - ${documents.length} documents`);
  console.log(`   - ${subprocessors.length} subprocessors`);
  console.log(`   - ${faqs.length} FAQs`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
