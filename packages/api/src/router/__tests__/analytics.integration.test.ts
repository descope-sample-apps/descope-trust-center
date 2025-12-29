import { TRPCError } from "@trpc/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { TestDB } from "../../test/setup";
import {
  cleanTestData,
  createAdminContext,
  createCaller,
  createPublicContext,
  createUserContext,
  isDockerAvailable,
  startTestDatabase,
  stopTestDatabase,
} from "../../test/setup";

const runIntegrationTests = isDockerAvailable();

describe.skipIf(!runIntegrationTests)(
  "analyticsRouter integration tests",
  () => {
    let db: TestDB;

    beforeAll(async () => {
      db = await startTestDatabase();
    }, 60000);

    afterAll(async () => {
      await stopTestDatabase();
    });

    beforeEach(async () => {
      await cleanTestData(db);
    });

    describe("trackDownload (public)", () => {
      it("inserts a document download record", async () => {
        const caller = createCaller(createPublicContext(db));

        const result = await caller.analytics.trackDownload({
          documentId: "doc-123",
          documentTitle: "Security Whitepaper",
          userEmail: "user@example.com",
          userName: "John Doe",
          company: "Acme Inc",
        });

        expect(result).toMatchObject({
          documentId: "doc-123",
          documentTitle: "Security Whitepaper",
          userEmail: "user@example.com",
        });
        expect(result?.id).toBeDefined();
      });

      it("allows anonymous downloads without email", async () => {
        const caller = createCaller(createPublicContext(db));

        const result = await caller.analytics.trackDownload({
          documentId: "doc-456",
          documentTitle: "Public Report",
        });

        expect(result?.userEmail).toBeNull();
        expect(result?.documentId).toBe("doc-456");
      });
    });

    describe("trackFormSubmission (public)", () => {
      it("inserts a contact form submission", async () => {
        const caller = createCaller(createPublicContext(db));

        const result = await caller.analytics.trackFormSubmission({
          type: "contact",
          email: "contact@example.com",
          name: "Jane Doe",
          company: "Tech Corp",
        });

        expect(result).toMatchObject({
          type: "contact",
          email: "contact@example.com",
          status: "pending",
        });
      });

      it("inserts a subprocessor subscription", async () => {
        const caller = createCaller(createPublicContext(db));

        const result = await caller.analytics.trackFormSubmission({
          type: "subprocessor_subscription",
          email: "subscriber@example.com",
        });

        expect(result?.type).toBe("subprocessor_subscription");
      });
    });

    describe("requestDocumentAccess (public)", () => {
      it("creates a pending access request", async () => {
        const caller = createCaller(createPublicContext(db));

        const result = await caller.analytics.requestDocumentAccess({
          documentId: "restricted-doc-1",
          documentTitle: "SOC 2 Report",
          email: "requester@company.com",
          name: "Bob Smith",
          company: "Company Inc",
          reason: "We need this for our annual security audit process",
        });

        expect(result).toMatchObject({
          id: expect.any(String),
          message: expect.stringContaining("Access request submitted"),
        });
      });
    });

    describe("getDownloadStats (admin only)", () => {
      beforeEach(async () => {
        const caller = createCaller(createPublicContext(db));
        for (const doc of ["doc-1", "doc-2", "doc-3"]) {
          await caller.analytics.trackDownload({
            documentId: doc,
            documentTitle: `Title ${doc}`,
          });
        }
      });

      it("returns download records for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.getDownloadStats({
          limit: 10,
          offset: 0,
        });

        expect(result.downloads).toHaveLength(3);
        expect(result.total).toBe(3);
        expect(result.hasMore).toBe(false);
      });

      it("supports pagination", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.getDownloadStats({
          limit: 2,
          offset: 0,
        });

        expect(result.downloads).toHaveLength(2);
        expect(result.total).toBe(3);
        expect(result.hasMore).toBe(true);
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(caller.analytics.getDownloadStats({})).rejects.toThrow(
          TRPCError,
        );
      });
    });

    describe("getFormStats (admin only)", () => {
      beforeEach(async () => {
        const caller = createCaller(createPublicContext(db));
        await caller.analytics.trackFormSubmission({
          type: "contact",
          email: "a@example.com",
        });
        await caller.analytics.trackFormSubmission({
          type: "contact",
          email: "b@example.com",
        });
        await caller.analytics.trackFormSubmission({
          type: "subprocessor_subscription",
          email: "c@example.com",
        });
      });

      it("returns all submissions for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.getFormStats({});

        expect(result.submissions).toHaveLength(3);
        expect(result.total).toBe(3);
      });

      it("filters by type", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.getFormStats({ type: "contact" });

        expect(result.submissions).toHaveLength(2);
        expect(result.submissions.every((s) => s.type === "contact")).toBe(
          true,
        );
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(caller.analytics.getFormStats({})).rejects.toThrow(
          TRPCError,
        );
      });
    });

    describe("getAccessRequests (admin only)", () => {
      beforeEach(async () => {
        const caller = createCaller(createPublicContext(db));
        await caller.analytics.requestDocumentAccess({
          documentId: "doc-1",
          documentTitle: "Doc 1",
          email: "a@example.com",
          name: "User A",
          company: "Company A",
          reason: "Need for audit purposes compliance",
        });
        await caller.analytics.requestDocumentAccess({
          documentId: "doc-2",
          documentTitle: "Doc 2",
          email: "b@example.com",
          name: "User B",
          company: "Company B",
          reason: "Compliance requirement review",
        });
      });

      it("returns all access requests for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.getAccessRequests({});

        expect(result.requests).toHaveLength(2);
        expect(result.total).toBe(2);
      });

      it("filters by status", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.getAccessRequests({
          status: "pending",
        });

        expect(result.requests).toHaveLength(2);
        expect(result.requests.every((r) => r.status === "pending")).toBe(true);
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(caller.analytics.getAccessRequests({})).rejects.toThrow(
          TRPCError,
        );
      });
    });

    describe("approveAccess (admin only)", () => {
      let requestId: string;

      beforeEach(async () => {
        const caller = createCaller(createPublicContext(db));
        const result = await caller.analytics.requestDocumentAccess({
          documentId: "doc-1",
          documentTitle: "SOC 2 Report",
          email: "requester@example.com",
          name: "Requester",
          company: "Company",
          reason: "Need for compliance review",
        });
        if (!result.id) {
          throw new Error("Expected requestDocumentAccess to return an id");
        }
        requestId = result.id;
      });

      it("approves access request for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.approveAccess({ requestId });

        expect(result.success).toBe(true);
        expect(result.request.status).toBe("approved");
        expect(result.request.approvedBy).toBe("admin@descope.com");
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(
          caller.analytics.approveAccess({ requestId }),
        ).rejects.toThrow(TRPCError);
      });

      it("throws NOT_FOUND for invalid request ID", async () => {
        const caller = createCaller(createAdminContext(db));

        await expect(
          caller.analytics.approveAccess({
            requestId: "00000000-0000-0000-0000-000000000000",
          }),
        ).rejects.toThrow(TRPCError);
      });
    });

    describe("denyAccess (admin only)", () => {
      let requestId: string;

      beforeEach(async () => {
        const caller = createCaller(createPublicContext(db));
        const result = await caller.analytics.requestDocumentAccess({
          documentId: "doc-1",
          documentTitle: "Confidential Report",
          email: "requester@example.com",
          name: "Requester",
          company: "Unknown Corp",
          reason: "Just curious about security",
        });
        if (!result.id) {
          throw new Error("Expected requestDocumentAccess to return an id");
        }
        requestId = result.id;
      });

      it("denies access request with reason for admin", async () => {
        const caller = createCaller(createAdminContext(db));
        const denialReason =
          "Request does not meet our verification requirements";

        const result = await caller.analytics.denyAccess({
          requestId,
          reason: denialReason,
        });

        expect(result.success).toBe(true);
        expect(result.request.status).toBe("denied");
        expect(result.request.deniedBy).toBe("admin@descope.com");
        expect(result.request.denialReason).toBe(denialReason);
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(
          caller.analytics.denyAccess({
            requestId,
            reason: "Some reason here",
          }),
        ).rejects.toThrow(TRPCError);
      });
    });

    describe("getDashboardSummary (admin only)", () => {
      beforeEach(async () => {
        const caller = createCaller(createPublicContext(db));
        await caller.analytics.trackDownload({
          documentId: "doc-1",
          documentTitle: "Doc 1",
        });
        await caller.analytics.trackDownload({
          documentId: "doc-2",
          documentTitle: "Doc 2",
        });
        await caller.analytics.trackFormSubmission({
          type: "contact",
          email: "a@example.com",
        });
        await caller.analytics.requestDocumentAccess({
          documentId: "doc-1",
          documentTitle: "Doc 1",
          email: "a@example.com",
          name: "User",
          company: "Company",
          reason: "Audit requirement compliance",
        });
      });

      it("returns aggregate counts for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.analytics.getDashboardSummary();

        expect(result.totalDownloads).toBe(2);
        expect(result.totalFormSubmissions).toBe(1);
        expect(result.pendingAccessRequests).toBe(1);
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(caller.analytics.getDashboardSummary()).rejects.toThrow(
          TRPCError,
        );
      });
    });
  },
);
