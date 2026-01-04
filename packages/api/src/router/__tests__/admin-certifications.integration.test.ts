import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { TestDB } from "../../test/setup";
import {
  cleanTestData,
  createAdminContext,
  createCaller,
  createUserContext,
  isDockerAvailable,
  startTestDatabase,
  stopTestDatabase,
} from "../../test/setup";

const runIntegrationTests = isDockerAvailable();

describe.skipIf(!runIntegrationTests)(
  "adminCertificationRouter integration tests",
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

    describe("getAll (admin only)", () => {
      it("returns all certifications for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        // Create a test certification first
        await caller.admin.certifications.create({
          id: "test-cert-1",
          name: "Test Certification",
          logo: "https://example.com/logo.png",
          description: "Test description",
          standards: ["ISO 27001"],
        });

        const result = await caller.admin.certifications.getAll();

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: "test-cert-1",
          name: "Test Certification",
          logo: "https://example.com/logo.png",
          description: "Test description",
          standards: ["ISO 27001"],
          status: "draft",
        });
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(caller.admin.certifications.getAll()).rejects.toThrow(
          "Admin access required",
        );
      });
    });

    describe("getById (admin only)", () => {
      it("returns certification by ID for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        // Create a test certification first
        await caller.admin.certifications.create({
          id: "test-cert-2",
          name: "Test Certification 2",
          logo: "https://example.com/logo2.png",
          description: "Test description 2",
          standards: ["SOC 2"],
        });

        const result = await caller.admin.certifications.getById({
          id: "test-cert-2",
        });

        expect(result).toMatchObject({
          id: "test-cert-2",
          name: "Test Certification 2",
          logo: "https://example.com/logo2.png",
          description: "Test description 2",
          standards: ["SOC 2"],
          status: "draft",
        });
      });

      it("throws NOT_FOUND for invalid ID", async () => {
        const caller = createCaller(createAdminContext(db));

        await expect(
          caller.admin.certifications.getById({ id: "nonexistent" }),
        ).rejects.toThrow("NOT_FOUND");
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(
          caller.admin.certifications.getById({ id: "test-cert-2" }),
        ).rejects.toThrow("Admin access required");
      });
    });

    describe("create (admin only)", () => {
      it("creates a new certification for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        const result = await caller.admin.certifications.create({
          id: "new-cert",
          name: "New Certification",
          logo: "https://example.com/new-logo.png",
          description: "New certification description",
          standards: ["GDPR", "CCPA"],
        });

        expect(result).toMatchObject({
          id: "new-cert",
          name: "New Certification",
          logo: "https://example.com/new-logo.png",
          description: "New certification description",
          standards: ["GDPR", "CCPA"],
          status: "draft",
        });
        expect(result.createdBy).toBe("admin-123");
        expect(result.updatedBy).toBe("admin-123");
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(
          caller.admin.certifications.create({
            id: "new-cert",
            name: "New Certification",
            logo: "https://example.com/new-logo.png",
            description: "New certification description",
            standards: ["GDPR"],
          }),
        ).rejects.toThrow("Admin access required");
      });
    });

    describe("update (admin only)", () => {
      it("updates an existing certification for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        // Create first
        await caller.admin.certifications.create({
          id: "update-cert",
          name: "Update Certification",
          logo: "https://example.com/update-logo.png",
          description: "Update description",
          standards: ["ISO 27001"],
        });

        // Update
        const result = await caller.admin.certifications.update({
          id: "update-cert",
          name: "Updated Certification",
          description: "Updated description",
          standards: ["ISO 27001", "SOC 2"],
        });

        expect(result).toMatchObject({
          id: "update-cert",
          name: "Updated Certification",
          logo: "https://example.com/update-logo.png",
          description: "Updated description",
          standards: ["ISO 27001", "SOC 2"],
          status: "draft",
        });
        expect(result.updatedBy).toBe("admin-123");
      });

      it("throws NOT_FOUND for invalid ID", async () => {
        const caller = createCaller(createAdminContext(db));

        await expect(
          caller.admin.certifications.update({
            id: "nonexistent",
            name: "Updated",
          }),
        ).rejects.toThrow("NOT_FOUND");
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(
          caller.admin.certifications.update({
            id: "update-cert",
            name: "Updated",
          }),
        ).rejects.toThrow("Admin access required");
      });
    });

    describe("delete (admin only)", () => {
      it("deletes a certification for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        // Create first
        await caller.admin.certifications.create({
          id: "delete-cert",
          name: "Delete Certification",
          logo: "https://example.com/delete-logo.png",
          description: "Delete description",
          standards: ["GDPR"],
        });

        // Delete
        const result = await caller.admin.certifications.delete({
          id: "delete-cert",
        });

        expect(result.id).toBe("delete-cert");

        // Verify deleted
        await expect(
          caller.admin.certifications.getById({ id: "delete-cert" }),
        ).rejects.toThrow("NOT_FOUND");
      });

      it("throws NOT_FOUND for invalid ID", async () => {
        const caller = createCaller(createAdminContext(db));

        await expect(
          caller.admin.certifications.delete({ id: "nonexistent" }),
        ).rejects.toThrow("NOT_FOUND");
      });

      it("rejects non-admin users", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(
          caller.admin.certifications.delete({ id: "delete-cert" }),
        ).rejects.toThrow("Admin access required");
      });
    });

    describe("publish/unpublish (admin only)", () => {
      it("publishes a certification for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        // Create first
        await caller.admin.certifications.create({
          id: "publish-cert",
          name: "Publish Certification",
          logo: "https://example.com/publish-logo.png",
          description: "Publish description",
          standards: ["ISO 27001"],
        });

        // Publish
        const result = await caller.admin.certifications.publish({
          id: "publish-cert",
        });

        expect(result.status).toBe("published");
        expect(result.updatedBy).toBe("admin-123");
      });

      it("unpublishes a certification for admin", async () => {
        const caller = createCaller(createAdminContext(db));

        // Create and publish first
        await caller.admin.certifications.create({
          id: "unpublish-cert",
          name: "Unpublish Certification",
          logo: "https://example.com/unpublish-logo.png",
          description: "Unpublish description",
          standards: ["SOC 2"],
        });
        await caller.admin.certifications.publish({ id: "unpublish-cert" });

        // Unpublish
        const result = await caller.admin.certifications.unpublish({
          id: "unpublish-cert",
        });

        expect(result.status).toBe("draft");
        expect(result.updatedBy).toBe("admin-123");
      });

      it("throws NOT_FOUND for invalid ID on publish", async () => {
        const caller = createCaller(createAdminContext(db));

        await expect(
          caller.admin.certifications.publish({ id: "nonexistent" }),
        ).rejects.toThrow("NOT_FOUND");
      });

      it("rejects non-admin users for publish", async () => {
        const caller = createCaller(createUserContext(db));

        await expect(
          caller.admin.certifications.publish({ id: "publish-cert" }),
        ).rejects.toThrow("Admin access required");
      });
    });
  },
);
