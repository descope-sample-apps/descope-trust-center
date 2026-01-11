import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

interface EmailServiceOptions {
  region?: string;
  fromEmail: string;
  notificationEmail: string;
}

interface SendEmailResult {
  messageId: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/\*/g, "&#42;");
}

interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export class EmailService {
  private ses: SESClient;
  private fromEmail: string;
  private notificationEmail: string;

  constructor(options: EmailServiceOptions) {
    this.ses = new SESClient({ region: options.region ?? "us-east-1" });
    this.fromEmail = options.fromEmail;
    this.notificationEmail = options.notificationEmail;
  }

  async sendEmail(
    params: SendEmailParams,
    maxRetries = 3,
  ): Promise<SendEmailResult> {
    if (!params.html && !params.text) {
      throw new Error("At least one of html or text must be provided");
    }

    let lastError: Error = new Error("");
    const toAddresses = Array.isArray(params.to) ? params.to : [params.to];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const command = new SendEmailCommand({
          Source: params.from,
          Destination: {
            ToAddresses: toAddresses,
          },
          Message: {
            Subject: { Data: params.subject, Charset: "UTF-8" },
            Body: {
              ...(params.html && {
                Html: { Data: params.html, Charset: "UTF-8" },
              }),
              ...(params.text && {
                Text: { Data: params.text, Charset: "UTF-8" },
              }),
            },
          },
          ...(params.replyTo && { ReplyToAddresses: [params.replyTo] }),
        });

        const result = await this.ses.send(command);

        console.log(
          `[Email Service] Email sent successfully on attempt ${attempt}:`,
          {
            to: params.to,
            subject: params.subject,
            messageId: result.MessageId,
          },
        );

        return { messageId: result.MessageId ?? "" };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        console.error(
          `[Email Service] Email send attempt ${attempt}/${maxRetries} failed:`,
          {
            to: params.to,
            subject: params.subject,
            error: lastError.message,
          },
        );

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`[Email Service] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(
      `[Email Service] All ${maxRetries} attempts failed. Final error:`,
      lastError.message,
    );

    try {
      await this.sendFailureAlert(params, lastError);
    } catch (alertError) {
      console.error(
        `[Email Service] Failed to send failure alert:`,
        alertError,
      );
    }

    throw new Error(
      `Failed to send email after ${maxRetries} attempts: ${lastError.message}`,
    );
  }

  private async sendFailureAlert(
    originalParams: SendEmailParams,
    error: Error,
  ) {
    const alertHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Delivery Failure Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Email Delivery Failure Alert</h2>

            <p>An email failed to send after multiple retry attempts. Please investigate.</p>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>Failed Email Details:</h3>
              <p><strong>To:</strong> ${Array.isArray(originalParams.to) ? originalParams.to.join(", ") : originalParams.to}</p>
              <p><strong>Subject:</strong> ${escapeHtml(originalParams.subject)}</p>
              <p><strong>From:</strong> ${escapeHtml(originalParams.from)}</p>
               <p><strong>Error:</strong> ${escapeHtml(error.message)}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>

            <p>Please check the email service configuration and retry sending if necessary.</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #718096; font-size: 14px;">
              This is an automated alert from the Descope Trust Center.
            </p>
          </div>
        </body>
      </html>
    `;

    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [this.notificationEmail] },
      Message: {
        Subject: {
          Data: "Email Delivery Failure Alert - Trust Center",
          Charset: "UTF-8",
        },
        Body: { Html: { Data: alertHtml, Charset: "UTF-8" } },
      },
    });

    try {
      await this.ses.send(command);
      console.log(
        `[Email Service] Failure alert sent to admin: ${this.notificationEmail}`,
      );
    } catch (alertError) {
      console.error(
        `[Email Service] Critical: Failed to send failure alert to admin:`,
        alertError,
      );
    }
  }

  async sendContactFormNotification({
    name,
    email,
    company,
    message,
  }: {
    name: string;
    email: string;
    company: string;
    message: string;
  }): Promise<SendEmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d;">New Trust Center Contact Form Submission</h2>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Contact Details:</h3>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              <p><strong>Company:</strong> ${escapeHtml(company)}</p>
            </div>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #718096; font-size: 14px;">
              This message was sent from the Descope Trust Center contact form.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      from: this.fromEmail,
      to: this.notificationEmail,
      subject: `Trust Center Inquiry: ${name} from ${company}`,
      html,
      replyTo: email,
    });
  }

  async sendDocumentRequestConfirmation({
    name,
    email,
    company,
    documentId,
    reason,
  }: {
    name: string;
    email: string;
    company: string;
    documentId: string;
    reason: string;
  }): Promise<SendEmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document Access Request Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d;">Document Access Request Received</h2>

            <p>Dear ${escapeHtml(name)},</p>

            <p>Thank you for your interest in accessing our trust documentation. We have received your request for document <strong>${escapeHtml(documentId)}</strong>.</p>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Request Details:</h3>
              <p><strong>Document:</strong> ${escapeHtml(documentId)}</p>
              <p><strong>Company:</strong> ${escapeHtml(company)}</p>
              <p><strong>Reason for Access:</strong></p>
              <p style="white-space: pre-wrap; margin-left: 20px;">${escapeHtml(reason)}</p>
            </div>

            <p>Our security team will review your request within 3 business days. You will receive a follow-up email with the access details or next steps.</p>

            <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:security@descope.com">security@descope.com</a>.</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #718096; font-size: 14px;">
              This is an automated message from the Descope Trust Center.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      from: this.fromEmail,
      to: email,
      subject: "Document Access Request Received - Descope Trust Center",
      html,
    });
  }

  async sendSubprocessorSubscriptionConfirmation({
    email,
  }: {
    email: string;
  }): Promise<SendEmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subscribed to Subprocessor Updates</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d;">Welcome to Subprocessor Updates</h2>

            <p>Thank you for subscribing to Descope's subprocessor update notifications!</p>

            <p>You will receive email notifications whenever we add, remove, or make changes to our subprocessor list. This helps ensure transparency about our data processing partners.</p>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>What to expect:</h3>
              <ul>
                <li>Notifications when subprocessors are added or removed</li>
                <li>Updates about changes to existing subprocessors</li>
                <li>Regular summaries of our subprocessor ecosystem</li>
              </ul>
            </div>

            <p>You can unsubscribe from these notifications at any time by clicking the unsubscribe link in any notification email.</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #718096; font-size: 14px;">
              This is an automated message from the Descope Trust Center.<br>
              <a href="#" style="color: #718096;">Unsubscribe from subprocessor updates</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      from: this.fromEmail,
      to: email,
      subject: "Subscribed to Subprocessor Updates - Descope Trust Center",
      html,
    });
  }

  async sendDocumentAccessApproval({
    email,
    name,
    documentId,
  }: {
    email: string;
    name: string;
    documentId: string;
  }): Promise<SendEmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document Access Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d;">Document Access Approved</h2>

            <p>Dear ${escapeHtml(name)},</p>

            <p>Great news! Your request for access to document <strong>${escapeHtml(documentId)}</strong> has been approved by our security team.</p>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3>Access Details:</h3>
              <p><strong>Document:</strong> ${escapeHtml(documentId)}</p>
              <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Approved</span></p>
            </div>

            <p>You will receive a secure download link via email within the next 24 hours. The link will be valid for 7 days.</p>

            <p>If you have any questions about accessing the document, please don't hesitate to contact us at <a href="mailto:security@descope.com">security@descope.com</a>.</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #718096; font-size: 14px;">
              This is an automated message from the Descope Trust Center.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      from: this.fromEmail,
      to: email,
      subject: `Document Access Approved: ${documentId} - Descope Trust Center`,
      html,
    });
  }

  async sendDocumentAccessDenial({
    email,
    name,
    documentId,
    reason,
  }: {
    email: string;
    name: string;
    documentId: string;
    reason?: string;
  }): Promise<SendEmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document Access Request Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d;">Document Access Request Update</h2>

            <p>Dear ${escapeHtml(name)},</p>

            <p>Thank you for your interest in accessing our trust documentation. After careful review, we are unable to approve your request for document <strong>${escapeHtml(documentId)}</strong> at this time.</p>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3>Request Details:</h3>
              <p><strong>Document:</strong> ${escapeHtml(documentId)}</p>
              <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Not Approved</span></p>
              ${reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ""}
            </div>

            <p>If you believe this decision was made in error or if you have additional information that might help us reconsider your request, please contact us at <a href="mailto:security@descope.com">security@descope.com</a>.</p>

            <p>We appreciate your understanding and continued interest in Descope's security practices.</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #718096; font-size: 14px;">
              This is an automated message from the Descope Trust Center.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      from: this.fromEmail,
      to: email,
      subject: `Document Access Request Update: ${documentId} - Descope Trust Center`,
      html,
    });
  }
}

export const createEmailService = (
  options: EmailServiceOptions,
): EmailService | null => {
  if (!options.fromEmail || !options.notificationEmail) {
    return null;
  }
  return new EmailService(options);
};
