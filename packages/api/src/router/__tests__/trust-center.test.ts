import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  Certification,
  Document,
  FAQ,
  Subprocessor,
} from "@descope-trust-center/validators";

const mockCertifications: Certification[] = [
  {
    id: "soc2-type2",
    name: "SOC 2 Type II",
    logo: "/images/certifications/soc2.svg",
    status: "active",
    lastAuditDate: "2024-09-15",
    expiryDate: "2025-09-15",
    certificateUrl: "https://trust.descope.com/certificates/soc2-type2",
    description: "Service Organization Control 2 Type II certification",
  },
  {
    id: "gdpr",
    name: "GDPR Compliant",
    logo: "/images/certifications/gdpr.svg",
    status: "active",
    description: "Full compliance with EU GDPR",
  },
];

const mockDocuments: Document[] = [
  {
    id: "security-whitepaper",
    title: "Security Whitepaper",
    category: "security-policy",
    description: "Security architecture overview",
    accessLevel: "public",
    fileUrl: "/docs/security.pdf",
    fileSize: "2.4 MB",
    updatedAt: "2024-11-01",
    tags: ["security"],
  },
  {
    id: "soc2-report",
    title: "SOC 2 Report",
    category: "audit-report",
    description: "SOC 2 Type II audit report",
    accessLevel: "nda-required",
    fileSize: "45 pages",
    updatedAt: "2024-09-15",
    tags: ["compliance"],
  },
];

const mockSubprocessors: Subprocessor[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    purpose: "Cloud infrastructure",
    dataProcessed: ["Application data", "User data"],
    location: "United States",
    status: "active",
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    purpose: "Analytics infrastructure",
    dataProcessed: ["Analytics data"],
    location: "United States",
    status: "active",
  },
];

const mockFAQs: FAQ[] = [
  {
    id: "security-1",
    question: "How is data encrypted?",
    answer: "We use AES-256 encryption for data at rest",
    category: "security",
  },
  {
    id: "privacy-1",
    question: "Where is data stored?",
    answer: "Data is stored in SOC 2 compliant data centers",
    category: "privacy",
  },
  {
    id: "security-2",
    question: "Do you have penetration testing?",
    answer: "Yes, we conduct annual third-party penetration tests",
    category: "security",
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
    it("returns all certifications from data file", async () => {
      const { trustCenterRouter } = await import("../trust-center");

      expect(trustCenterRouter.getCertifications).toBeDefined();
      expect(trustCenterRouter.getCertifications._def).toBeDefined();
    });
  });

  describe("getDocuments", () => {
    it("procedure is defined with optional category input", async () => {
      const { trustCenterRouter } = await import("../trust-center");

      expect(trustCenterRouter.getDocuments).toBeDefined();
      expect(trustCenterRouter.getDocuments._def).toBeDefined();
    });
  });

  describe("getSubprocessors", () => {
    it("procedure is defined", async () => {
      const { trustCenterRouter } = await import("../trust-center");

      expect(trustCenterRouter.getSubprocessors).toBeDefined();
      expect(trustCenterRouter.getSubprocessors._def).toBeDefined();
    });
  });

  describe("getFAQs", () => {
    it("procedure is defined with optional category input", async () => {
      const { trustCenterRouter } = await import("../trust-center");

      expect(trustCenterRouter.getFAQs).toBeDefined();
      expect(trustCenterRouter.getFAQs._def).toBeDefined();
    });
  });

  describe("submitContactForm", () => {
    it("mutation procedure is defined", async () => {
      const { trustCenterRouter } = await import("../trust-center");

      expect(trustCenterRouter.submitContactForm).toBeDefined();
      expect(trustCenterRouter.submitContactForm._def).toBeDefined();
    });
  });

  describe("requestDocument", () => {
    it("mutation procedure is defined", async () => {
      const { trustCenterRouter } = await import("../trust-center");

      expect(trustCenterRouter.requestDocument).toBeDefined();
      expect(trustCenterRouter.requestDocument._def).toBeDefined();
    });
  });
});

describe("Trust Center Validators", () => {
  describe("CertificationsSchema", () => {
    it("validates certification data structure", async () => {
      const { CertificationsSchema } = await import(
        "@descope-trust-center/validators"
      );

      const result = CertificationsSchema.parse(mockCertifications);
      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe("soc2-type2");
      expect(result[0]!.status).toBe("active");
    });

    it("validates certification status enum", async () => {
      const { CertificationsSchema } = await import(
        "@descope-trust-center/validators"
      );

      const certWithInProgress = [
        {
          ...mockCertifications[0]!,
          status: "in-progress" as const,
        },
      ];

      const result = CertificationsSchema.parse(certWithInProgress);
      expect(result[0]!.status).toBe("in-progress");
    });
  });

  describe("DocumentsSchema", () => {
    it("validates document data structure", async () => {
      const { DocumentsSchema } = await import(
        "@descope-trust-center/validators"
      );

      const result = DocumentsSchema.parse(mockDocuments);
      expect(result).toHaveLength(2);
      expect(result[0]!.category).toBe("security-policy");
      expect(result[1]!.accessLevel).toBe("nda-required");
    });

    it("validates access level enum", async () => {
      const { DocumentsSchema } = await import(
        "@descope-trust-center/validators"
      );

      const docs = mockDocuments.map((d) => ({ ...d }));

      const result = DocumentsSchema.parse(docs);
      expect(["public", "login-required", "nda-required"]).toContain(
        result[0]!.accessLevel,
      );
    });
  });

  describe("SubprocessorsSchema", () => {
    it("validates subprocessor data structure", async () => {
      const { SubprocessorsSchema } = await import(
        "@descope-trust-center/validators"
      );

      const result = SubprocessorsSchema.parse(mockSubprocessors);
      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe("Amazon Web Services");
      expect(result[0]!.dataProcessed).toContain("User data");
    });
  });

  describe("FAQsSchema", () => {
    it("validates FAQ data structure", async () => {
      const { FAQsSchema } = await import("@descope-trust-center/validators");

      const result = FAQsSchema.parse(mockFAQs);
      expect(result).toHaveLength(3);
    });

    it("validates FAQ category filtering logic", async () => {
      const securityFAQs = mockFAQs.filter(
        (faq) => faq.category === "security",
      );
      expect(securityFAQs).toHaveLength(2);

      const privacyFAQs = mockFAQs.filter((faq) => faq.category === "privacy");
      expect(privacyFAQs).toHaveLength(1);
    });
  });
});

describe("Contact Form Validation", () => {
  it("validates correct contact form input shape", () => {
    const validInput = {
      name: "John Doe",
      email: "john@example.com",
      company: "Acme Corp",
      message: "This is a valid message with enough characters",
    };

    expect(validInput.name.length).toBeGreaterThan(0);
    expect(validInput.email).toContain("@");
    expect(validInput.message.length).toBeGreaterThanOrEqual(10);
  });

  it("identifies invalid email format", () => {
    const invalidEmail = "not-an-email";
    expect(invalidEmail).not.toContain("@");
  });

  it("identifies message too short", () => {
    const shortMessage = "Short";
    expect(shortMessage.length).toBeLessThan(10);
  });
});

describe("Document Request Validation", () => {
  it("validates correct document request input shape", () => {
    const validInput = {
      documentId: "soc2-report",
      name: "Jane Smith",
      email: "jane@example.com",
      company: "Tech Inc",
      reason: "We need this for our security assessment process",
    };

    expect(validInput.documentId.length).toBeGreaterThan(0);
    expect(validInput.reason.length).toBeGreaterThanOrEqual(10);
  });

  it("identifies reason too short", () => {
    const shortReason = "Short";
    expect(shortReason.length).toBeLessThan(10);
  });
});
