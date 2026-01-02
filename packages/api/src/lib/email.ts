import { Resend } from "resend";

interface EmailServiceOptions {
  apiKey: string;
  fromEmail: string;
  notificationEmail: string;
}

/**
 * Email service for sending transactional emails
 */
export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private notificationEmail: string;

  constructor(options: EmailServiceOptions) {
    this.resend = new Resend(options.apiKey);
    this.fromEmail = options.fromEmail;
    this.notificationEmail = options.notificationEmail;
  }

  /**
   * Send an email using Resend
   */
  async sendEmail(params: {
    to: string | string[];
    from: string;
    subject: string;
    html?: string;
    text?: string;
    reply_to?: string;
  }) {
    try {
      const emailData: any = {
        from: params.from,
        to: params.to,
        subject: params.subject,
      };

      if (params.html) {
        emailData.html = params.html;
      }
      if (params.text) {
        emailData.text = params.text;
      }
      if (params.reply_to) {
        emailData.replyTo = params.reply_to;
      }

      const result = await this.resend.emails.send(emailData);

      console.log(`[Email Service] Email sent successfully:`, {
        to: params.to,
        subject: params.subject,
        id: result.data?.id,
      });

      return result;
    } catch (error) {
      console.error(`[Email Service] Failed to send email:`, {
        to: params.to,
        subject: params.subject,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Send contact form notification to internal team
   */
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
  }) {
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
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Company:</strong> ${company}</p>
            </div>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
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
      reply_to: email,
    });
  }

  /**
   * Send document request confirmation to user
   */
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
  }) {
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

            <p>Dear ${name},</p>

            <p>Thank you for your interest in accessing our trust documentation. We have received your request for document <strong>${documentId}</strong>.</p>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Request Details:</h3>
              <p><strong>Document:</strong> ${documentId}</p>
              <p><strong>Company:</strong> ${company}</p>
              <p><strong>Reason for Access:</strong></p>
              <p style="white-space: pre-wrap; margin-left: 20px;">${reason}</p>
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
      from: "Trust Center <noreply@descope.com>",
      to: email,
      subject: "Document Access Request Received - Descope Trust Center",
      html,
    });
  }

  /**
   * Send subprocessor subscription confirmation
   */
  async sendSubprocessorSubscriptionConfirmation({ email }: { email: string }) {
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
      from: "Trust Center <noreply@descope.com>",
      to: email,
      subject: "Subscribed to Subprocessor Updates - Descope Trust Center",
      html,
    });
  }
}

// Export factory function
export const createEmailService = (options: EmailServiceOptions) =>
  new EmailService(options);
