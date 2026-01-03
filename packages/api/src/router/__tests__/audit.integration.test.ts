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

describe.skipIf(!runIntegrationTests)("auditRouter integration tests", () => {
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

  describe("log (public)", () => {
    it("inserts an audit log record", async () => {
      const caller = createCaller(createPublicContext(db));

      const result = await caller.audit.log({
        action: "view",
        entityType: "document",
        entityId: "doc-123",
        userEmail: "user@example.com",
        userName: "John Doe",
        details: { page: "/documents" },
      });

      expect(result).toMatchObject({
        action: "view",
        entityType: "document",
        entityId: "doc-123",
        userEmail: "user@example.com",
      });
      expect(result?.id).toBeDefined();
    });

    it("allows anonymous logging without user details", async () => {
      const caller = createCaller(createPublicContext(db));

      const result = await caller.audit.log({
        action: "view",
        entityType: "page",
        entityId: "home",
      });

      expect(result?.userEmail).toBeNull();
      expect(result?.action).toBe("view");
    });
  });

  describe("list (admin only)", () => {
    beforeEach(async () => {
      const caller = createCaller(createPublicContext(db));
      await caller.audit.log({
        action: "view",
        entityType: "document",
        entityId: "doc-1",
        userEmail: "user1@example.com",
      });
      await caller.audit.log({
        action: "download",
        entityType: "document",
        entityId: "doc-2",
        userEmail: "user2@example.com",
      });
    });

    it("returns audit logs for admin", async () => {
      const caller = createCaller(createAdminContext(db));

      const result = await caller.audit.list({ limit: 10, offset: 0 });

      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it("supports filtering by action", async () => {
      const caller = createCaller(createAdminContext(db));

      const result = await caller.audit.list({
        action: "view",
        limit: 10,
        offset: 0,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0]?.action).toBe("view");
    });

    it("rejects non-admin users", async () => {
      const caller = createCaller(createUserContext(db));

      await expect(caller.audit.list({})).rejects.toThrow(TRPCError);
    });
  });

  describe("getStats (admin only)", () => {
    beforeEach(async () => {
      const caller = createCaller(createPublicContext(db));
      await caller.audit.log({ action: "view", entityType: "document" });
      await caller.audit.log({ action: "download", entityType: "document" });
      await caller.audit.log({ action: "create", entityType: "user" });
    });

    it("returns aggregated statistics for admin", async () => {
      const caller = createCaller(createAdminContext(db));

      const result = await caller.audit.getStats({ days: 30 });

      expect(result.views).toBe(1);
      expect(result.downloads).toBe(1);
      expect(result.creates).toBe(1);
      expect(result.updates).toBe(0);
    });

    it("rejects non-admin users", async () => {
      const caller = createCaller(createUserContext(db));

      await expect(caller.audit.getStats({})).rejects.toThrow(TRPCError);
    });
  });

  describe("export (admin only)", () => {
    beforeEach(async () => {
      const caller = createCaller(createPublicContext(db));
      await caller.audit.log({
        action: "view",
        entityType: "document",
        entityId: "doc-1",
        userEmail: "user@example.com",
      });
    });

    it("exports logs in JSON format for admin", async () => {
      const caller = createCaller(createAdminContext(db));

      const result = await caller.audit.export({
        format: "json",
        limit: 10,
      });

      expect(result.format).toBe("json");
      expect(result.data).toContain("view");
      expect(result.data).toContain("user@example.com");
    });

    it("exports logs in CSV format for admin", async () => {
      const caller = createCaller(createAdminContext(db));

      const result = await caller.audit.export({
        format: "csv",
        limit: 10,
      });

      expect(result.format).toBe("csv");
      expect(result.data).toContain("action");
      expect(result.data).toContain("view");
    });

    it("rejects non-admin users", async () => {
      const caller = createCaller(createUserContext(db));

      await expect(
        caller.audit.export({ format: "json", limit: 10 }),
      ).rejects.toThrow(TRPCError);
    });
  });
});
