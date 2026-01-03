import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmailService } from "../email";

// Mock Resend
const mockSend = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService({
      apiKey: "test-key",
      fromEmail: "test@descope.com",
      notificationEmail: "admin@descope.com",
    });
  });

  describe("sendEmail", () => {
    it("should send email successfully on first attempt", async () => {
      const mockResult = { data: { id: "test-id" }, error: null };
      mockSend.mockResolvedValueOnce(mockResult);

      const result = await emailService.sendEmail({
        from: "test@descope.com",
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(result).toBe(mockResult);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        from: "test@descope.com",
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });
    });

    it("should retry on failure and succeed on second attempt", async () => {
      const mockError = new Error("Network error");
      const mockResult = { data: { id: "test-id" }, error: null };

      mockSend
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResult);

      const result = await emailService.sendEmail({
        from: "test@descope.com",
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(result).toBe(mockResult);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it("should throw error after all retries fail", async () => {
      const mockError = new Error("Persistent network error");
      mockSend.mockRejectedValue(mockError);

      await expect(
        emailService.sendEmail({
          from: "test@descope.com",
          to: "user@example.com",
          subject: "Test Subject",
          html: "<p>Test content</p>",
        }),
      ).rejects.toThrow(
        "Failed to send email after 3 attempts: Persistent network error",
      );

      expect(mockSend).toHaveBeenCalledTimes(4); // 3 retries + 1 failure alert
    });

    it("should send failure alert when all retries fail", async () => {
      const mockError = new Error("Network error");
      const mockAlertResult = { data: { id: "alert-id" }, error: null };

      mockSend
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockAlertResult); // Alert email succeeds

      await expect(
        emailService.sendEmail({
          from: "test@descope.com",
          to: "user@example.com",
          subject: "Test Subject",
          html: "<p>Test content</p>",
        }),
      ).rejects.toThrow();

      // Should have attempted original send 3 times + 1 alert
      expect(mockSend).toHaveBeenCalledTimes(4);
    });
  });

  describe("sendContactFormNotification", () => {
    it("should send contact form notification with escaped HTML", async () => {
      const mockResult = { data: { id: "test-id" }, error: null };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendContactFormNotification({
        name: "John <script>alert('xss')</script> Doe",
        email: "john@example.com",
        company: "Test & Co",
        message: "Test message with <b>bold</b> text",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "test@descope.com",
          to: "admin@descope.com",
          subject:
            "Trust Center Inquiry: John <script>alert('xss')</script> Doe from Test & Co",
          html: expect.stringContaining(
            "John &lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt; Doe",
          ),
        }),
      );
    });
  });

  describe("sendDocumentRequestConfirmation", () => {
    it("should send document request confirmation with escaped content", async () => {
      const mockResult = { data: { id: "test-id" }, error: null };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendDocumentRequestConfirmation({
        name: "Jane <b>Doe</b>",
        email: "jane@example.com",
        company: "Test & Co",
        documentId: "doc-123",
        reason: "Need for <em>security</em> audit",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "test@descope.com",
          to: "jane@example.com",
          subject: "Document Access Request Received - Descope Trust Center",
          html: expect.stringContaining("Jane &lt;b&gt;Doe&lt;&#x2F;b&gt;"),
        }),
      );
    });
  });

  describe("sendDocumentAccessApproval", () => {
    it("should send approval notification", async () => {
      const mockResult = { data: { id: "test-id" }, error: null };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendDocumentAccessApproval({
        email: "user@example.com",
        name: "John Doe",
        documentId: "soc2-report",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "test@descope.com",
          to: "user@example.com",
          subject:
            "Document Access Approved: soc2-report - Descope Trust Center",
          html: expect.stringContaining("Document Access Approved"),
        }),
      );
    });
  });

  describe("sendDocumentAccessDenial", () => {
    it("should send denial notification with reason", async () => {
      const mockResult = { data: { id: "test-id" }, error: null };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendDocumentAccessDenial({
        email: "user@example.com",
        name: "John Doe",
        documentId: "soc2-report",
        reason: "Insufficient security clearance",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "test@descope.com",
          to: "user@example.com",
          subject:
            "Document Access Request Update: soc2-report - Descope Trust Center",
          html: expect.stringContaining("Not Approved"),
        }),
      );
    });

    it("should send denial notification without reason", async () => {
      const mockResult = { data: { id: "test-id" }, error: null };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendDocumentAccessDenial({
        email: "user@example.com",
        name: "John Doe",
        documentId: "soc2-report",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.not.stringContaining("<strong>Reason:</strong>"),
        }),
      );
    });
  });
});
