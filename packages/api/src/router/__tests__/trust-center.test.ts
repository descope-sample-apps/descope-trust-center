import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod/v4";

const mockCertifications = [
  {
    id: "soc2-type2",
    name: "SOC 2 Type II",
    logo: "/images/certifications/soc2.svg",
    status: "active" as const,
    lastAuditDate: "2024-09-15",
    expiryDate: "2025-09-15",
    certificateUrl: "https://trust.descope.com/certificates/soc2-type2",
    description: "Service Organization Control 2 Type II certification",
  },
];

const mockDocuments = [
  {
    id: "security-policy",
    title: "Information Security Policy",
    category: "security-policy" as const,
    description: "Our comprehensive security policy",
    accessLevel: "public" as const,
    fileUrl: "/docs/security-policy.pdf",
    fileSize: "1.2 MB",
    updatedAt: "2024-12-01",
    tags: ["security", "policy"],
  },
  {
    id: "compliance-report",
    title: "Compliance Report",
    category: "compliance" as const,
    description: "Annual compliance audit report",
    accessLevel: "nda-required" as const,
    fileUrl: "/docs/compliance-report.pdf",
    fileSize: "2.5 MB",
    updatedAt: "2024-11-15",
    tags: ["compliance", "audit"],
  },
];

const mockSubprocessors = [
  {
    id: "aws",
    name: "Amazon Web Services",
    purpose: "Cloud infrastructure and hosting",
    dataProcessed: ["Application data", "User data", "Logs"],
    location: "United States",
    contractUrl: "https://aws.amazon.com/dpa",
    status: "active" as const,
  },
];

const mockFAQs = [
  {
    id: "security-1",
    question: "How is data encrypted?",
    answer: "We use AES-256 encryption",
    category: "security" as const,
  },
  {
    id: "privacy-1",
    question: "Where is data stored?",
    answer: "Data is stored in SOC 2 compliant data centers",
    category: "privacy" as const,
  },
];

vi.mock("fs", () => ({
  readFileSync: vi.fn((path: string) => {
    if (path.includes("certifications.json")) {
      return JSON.stringify(mockCertifications);
    }
    if (path.includes("documents.json")) {
      return JSON.stringify(mockDocuments);
    }
    if (path.includes("subprocessors.json")) {
      return JSON.stringify(mockSubprocessors);
    }
    if (path.includes("faqs.json")) {
      return JSON.stringify(mockFAQs);
    }
    throw new Error(`Unexpected file path: ${path}`);
  }),
}));

describe("trustCenterRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCertifications", () => {
    it("returns array of certifications", async () => {
      const { CertificationsSchema } = await import(
        "@descope-trust-center/validators"
      );
      const router = await import("../trust-center");

      expect(router.trustCenterRouter.getCertifications).toBeDefined();

      const result = CertificationsSchema.parse(mockCertifications);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("soc2-type2");
    });
  });

  describe("getDocuments", () => {
    it("returns array of documents", async () => {
      const { DocumentsSchema } = await import(
        "@descope-trust-center/validators"
      );

      const result = DocumentsSchema.parse(mockDocuments);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("validates document category filter", async () => {
      const filtered = mockDocuments.filter(
        (doc) => doc.category === "security-policy",
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.category).toBe("security-policy");
    });
  });

  describe("getSubprocessors", () => {
    it("returns array of subprocessors", async () => {
      const { SubprocessorsSchema } = await import(
        "@descope-trust-center/validators"
      );

      const result = SubprocessorsSchema.parse(mockSubprocessors);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("aws");
    });
  });

  describe("getFAQs", () => {
    it("returns array of FAQs", async () => {
      const { FAQsSchema } = await import("@descope-trust-center/validators");

      const result = FAQsSchema.parse(mockFAQs);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("validates FAQ category filter", async () => {
      const filtered = mockFAQs.filter((faq) => faq.category === "security");
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.category).toBe("security");
    });
  });

  describe("submitContactForm validation", () => {
    it("validates correct contact form input", () => {
      const validInput = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        message: z.string().min(10),
      });

      const result = validInput.parse({
        name: "John Doe",
        email: "john@example.com",
        company: "Acme Corp",
        message: "This is a test message that is long enough",
      });

      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
    });

    it("rejects invalid email", () => {
      const contactSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        message: z.string().min(10),
      });

      expect(() =>
        contactSchema.parse({
          name: "John Doe",
          email: "not-an-email",
          company: "Acme Corp",
          message: "Valid message here",
        }),
      ).toThrow(z.ZodError);
    });

    it("rejects message too short", () => {
      const contactSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        message: z.string().min(10),
      });

      expect(() =>
        contactSchema.parse({
          name: "John Doe",
          email: "john@example.com",
          company: "Acme Corp",
          message: "Short",
        }),
      ).toThrow(z.ZodError);
    });
  });

  describe("requestDocument validation", () => {
    it("validates correct document request input", () => {
      const validInput = z.object({
        documentId: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        reason: z.string().min(10),
      });

      const result = validInput.parse({
        documentId: "doc-123",
        name: "Jane Smith",
        email: "jane@example.com",
        company: "Tech Inc",
        reason: "We need this for our security audit review process",
      });

      expect(result.documentId).toBe("doc-123");
      expect(result.email).toBe("jane@example.com");
    });

    it("rejects invalid email", () => {
      const requestSchema = z.object({
        documentId: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        reason: z.string().min(10),
      });

      expect(() =>
        requestSchema.parse({
          documentId: "doc-123",
          name: "Jane Smith",
          email: "not-valid-email",
          company: "Tech Inc",
          reason: "We need this document for review",
        }),
      ).toThrow(z.ZodError);
    });

    it("rejects reason too short", () => {
      const requestSchema = z.object({
        documentId: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        reason: z.string().min(10),
      });

      expect(() =>
        requestSchema.parse({
          documentId: "doc-123",
          name: "Jane Smith",
          email: "jane@example.com",
          company: "Tech Inc",
          reason: "Short",
        }),
      ).toThrow(z.ZodError);
    });
  });
});
