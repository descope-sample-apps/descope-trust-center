import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "../email";

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set mock API key
    process.env.RESEND_API_KEY = "test-api-key";
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      const mockResponse = {
        id: "test-email-id",
      };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Subject",
        text: "Test message",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("test-email-id");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "noreply@descope.com",
            to: ["test@example.com"],
            subject: "Test Subject",
            html: undefined,
            text: "Test message",
          }),
        }),
      );
    });

    it("should handle multiple recipients", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "test-id" }),
      });

      await sendEmail({
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test",
        text: "Message",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: JSON.stringify({
            from: "noreply@descope.com",
            to: ["user1@example.com", "user2@example.com"],
            subject: "Test",
            html: undefined,
            text: "Message",
          }),
        }),
      );
    });

    it("should use custom from address", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "test-id" }),
      });

      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        text: "Message",
        from: "custom@descope.com",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          body: JSON.stringify({
            from: "custom@descope.com",
            to: ["test@example.com"],
            subject: "Test",
            html: undefined,
            text: "Message",
          }),
        }),
      );
    });

    it("should handle API errors", async () => {
      const errorResponse = { message: "Invalid API key" };
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        text: "Message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toEqual(errorResponse);
    });

    it("should handle network errors", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        text: "Message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });
});
