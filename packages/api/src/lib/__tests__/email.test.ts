import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmailService } from "../email";

const mockSend = vi.fn();
vi.mock("@aws-sdk/client-ses", () => ({
  SESClient: vi.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  SendEmailCommand: vi.fn().mockImplementation((params) => params),
}));

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService({
      region: "us-east-1",
      fromEmail: "test@descope.com",
      notificationEmail: "admin@descope.com",
    });
  });

  describe("sendEmail", () => {
    it("should send email successfully on first attempt", async () => {
      const mockResult = { MessageId: "test-id" };
      mockSend.mockResolvedValueOnce(mockResult);

      const result = await emailService.sendEmail({
        from: "test@descope.com",
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(result).toEqual({ messageId: "test-id" });
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Source: "test@descope.com",
          Destination: { ToAddresses: ["user@example.com"] },
          Message: expect.objectContaining({
            Subject: { Data: "Test Subject", Charset: "UTF-8" },
          }),
        }),
      );
    });

    it("should retry on failure and succeed on second attempt", async () => {
      const mockError = new Error("Network error");
      const mockResult = { MessageId: "test-id" };

      mockSend
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResult);

      const result = await emailService.sendEmail({
        from: "test@descope.com",
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(result).toEqual({ messageId: "test-id" });
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
      const mockAlertResult = { MessageId: "alert-id" };

      mockSend
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockAlertResult);

      await expect(
        emailService.sendEmail({
          from: "test@descope.com",
          to: "user@example.com",
          subject: "Test Subject",
          html: "<p>Test content</p>",
        }),
      ).rejects.toThrow();

      expect(mockSend).toHaveBeenCalledTimes(4);
    });
  });

  describe("sendContactFormNotification", () => {
    it("should send contact form notification with escaped HTML", async () => {
      const mockResult = { MessageId: "test-id" };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendContactFormNotification({
        name: "John <script>alert('xss')</script> Doe",
        email: "john@example.com",
        company: "Test & Co",
        message: "Test message with <b>bold</b> text",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Source: "test@descope.com",
          Destination: { ToAddresses: ["admin@descope.com"] },
          Message: expect.objectContaining({
            Subject: expect.objectContaining({
              Data: "Trust Center Inquiry: John <script>alert('xss')</script> Doe from Test & Co",
            }),
            Body: expect.objectContaining({
              Html: expect.objectContaining({
                Data: expect.stringContaining(
                  "John &lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt; Doe",
                ),
              }),
            }),
          }),
        }),
      );
    });
  });

  describe("sendDocumentRequestConfirmation", () => {
    it("should send document request confirmation with escaped content", async () => {
      const mockResult = { MessageId: "test-id" };
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
          Source: "test@descope.com",
          Destination: { ToAddresses: ["jane@example.com"] },
          Message: expect.objectContaining({
            Subject: expect.objectContaining({
              Data: "Document Access Request Received - Descope Trust Center",
            }),
            Body: expect.objectContaining({
              Html: expect.objectContaining({
                Data: expect.stringContaining(
                  "Jane &lt;b&gt;Doe&lt;&#x2F;b&gt;",
                ),
              }),
            }),
          }),
        }),
      );
    });
  });

  describe("sendDocumentAccessApproval", () => {
    it("should send approval notification", async () => {
      const mockResult = { MessageId: "test-id" };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendDocumentAccessApproval({
        email: "user@example.com",
        name: "John Doe",
        documentId: "soc2-report",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Source: "test@descope.com",
          Destination: { ToAddresses: ["user@example.com"] },
          Message: expect.objectContaining({
            Subject: expect.objectContaining({
              Data: "Document Access Approved: soc2-report - Descope Trust Center",
            }),
            Body: expect.objectContaining({
              Html: expect.objectContaining({
                Data: expect.stringContaining("Document Access Approved"),
              }),
            }),
          }),
        }),
      );
    });
  });

  describe("sendDocumentAccessDenial", () => {
    it("should send denial notification with reason", async () => {
      const mockResult = { MessageId: "test-id" };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendDocumentAccessDenial({
        email: "user@example.com",
        name: "John Doe",
        documentId: "soc2-report",
        reason: "Insufficient security clearance",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Source: "test@descope.com",
          Destination: { ToAddresses: ["user@example.com"] },
          Message: expect.objectContaining({
            Subject: expect.objectContaining({
              Data: "Document Access Request Update: soc2-report - Descope Trust Center",
            }),
            Body: expect.objectContaining({
              Html: expect.objectContaining({
                Data: expect.stringContaining("Not Approved"),
              }),
            }),
          }),
        }),
      );
    });

    it("should send denial notification without reason", async () => {
      const mockResult = { MessageId: "test-id" };
      mockSend.mockResolvedValueOnce(mockResult);

      await emailService.sendDocumentAccessDenial({
        email: "user@example.com",
        name: "John Doe",
        documentId: "soc2-report",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Message: expect.objectContaining({
            Body: expect.objectContaining({
              Html: expect.objectContaining({
                Data: expect.not.stringContaining("<strong>Reason:</strong>"),
              }),
            }),
          }),
        }),
      );
    });
  });
});
