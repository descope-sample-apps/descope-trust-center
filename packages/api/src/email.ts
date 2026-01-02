export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text, from = "noreply@descope.com" } = options;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    const result = (await response.json()) as { id?: string; message?: string };

    if (!response.ok) {
      console.error("Failed to send email:", result);
      return { success: false, error: result };
    }

    return { success: true, id: result.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  contactFormConfirmation: (name: string) => ({
    subject: "Thank you for contacting Descope Trust Center",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thank you for contacting Descope Trust Center</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .button { display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <h1 style="color: #1e293b; margin-bottom: 20px;">Thank you for reaching out, ${name}!</h1>
              <p>We have received your message and will get back to you within 24 hours.</p>
              <p>Best regards,<br>The Descope Trust Center Team</p>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Thank you for reaching out, ${name}! We have received your message and will get back to you within 24 hours. Best regards, The Descope Trust Center Team`,
  }),

  contactFormNotification: (data: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }) => ({
    subject: "New contact form submission",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: 600; color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <h1 style="color: #1e293b; margin-bottom: 20px;">New Contact Form Submission</h1>
              <div class="field"><span class="label">Name:</span> ${data.name}</div>
              <div class="field"><span class="label">Email:</span> ${data.email}</div>
              <div class="field"><span class="label">Company:</span> ${data.company ?? "Not provided"}</div>
              <div class="field"><span class="label">Message:</span></div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 10px;">${data.message.replace(/\n/g, "<br>")}</div>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company ?? "Not provided"}\nMessage:\n${data.message}`,
  }),

  documentRequestConfirmation: (data: {
    name: string;
    email: string;
    company?: string;
    reason: string;
  }) => ({
    subject: "Document access request received",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document Access Request Received</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-item { margin-bottom: 10px; }
            .label { font-weight: 600; color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <h1 style="color: #1e293b; margin-bottom: 20px;">Document Access Request Received</h1>
              <p>Dear ${data.name},</p>
              <p>We have received your request for document access. Our security team will review your request and respond within 3-5 business days.</p>
              <div class="details">
                <h3 style="margin-top: 0; color: #1e293b;">Request Details:</h3>
                <div class="detail-item"><span class="label">Name:</span> ${data.name}</div>
                <div class="detail-item"><span class="label">Email:</span> ${data.email}</div>
                <div class="detail-item"><span class="label">Company:</span> ${data.company ?? "Not provided"}</div>
                <div class="detail-item"><span class="label">Reason:</span> ${data.reason}</div>
              </div>
              <p>Best regards,<br>The Descope Trust Center Team</p>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Document Access Request Received\n\nDear ${data.name},\n\nWe have received your request for document access. Our security team will review your request and respond within 3-5 business days.\n\nRequest Details:\n- Name: ${data.name}\n- Email: ${data.email}\n- Company: ${data.company ?? "Not provided"}\n- Reason: ${data.reason}\n\nBest regards,\nThe Descope Trust Center Team`,
  }),

  documentRequestNotification: (data: {
    name: string;
    email: string;
    company?: string;
    reason: string;
    documentId: string;
  }) => ({
    subject: "New document access request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Document Access Request</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .details { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
            .detail-item { margin-bottom: 10px; }
            .label { font-weight: 600; color: #1e293b; }
            .button { display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <h1 style="color: #1e293b; margin-bottom: 20px;">New Document Access Request</h1>
              <div class="details">
                <div class="detail-item"><span class="label">Document ID:</span> ${data.documentId}</div>
                <div class="detail-item"><span class="label">Requester:</span> ${data.name} (${data.email})</div>
                <div class="detail-item"><span class="label">Company:</span> ${data.company ?? "Not provided"}</div>
                <div class="detail-item"><span class="label">Reason:</span> ${data.reason}</div>
              </div>
              <p>Please review this request in the admin dashboard.</p>
              <a href="https://descope.com/trust-center/analytics/access-requests" class="button">Review Request</a>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `New Document Access Request\n\nDocument ID: ${data.documentId}\nRequester: ${data.name} (${data.email})\nCompany: ${data.company ?? "Not provided"}\nReason: ${data.reason}\n\nPlease review this request in the admin dashboard.`,
  }),

  documentRequestApproved: (data: {
    name: string;
    email: string;
    documentName: string;
    downloadLink: string;
  }) => ({
    subject: "Document access approved",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document Access Approved</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <div class="success">
                <h1 style="color: #065f46; margin-bottom: 10px;">Document Access Approved</h1>
              </div>
              <p>Dear ${data.name},</p>
              <p>Your request for access to <strong>"${data.documentName}"</strong> has been approved.</p>
              <a href="${data.downloadLink}" class="button">Download Document</a>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This link will expire in 7 days.</p>
              <p>Best regards,<br>The Descope Trust Center Team</p>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Document Access Approved\n\nDear ${data.name},\n\nYour request for access to "${data.documentName}" has been approved.\n\nDownload link: ${data.downloadLink}\n\nThis link will expire in 7 days.\n\nBest regards,\nThe Descope Trust Center Team`,
  }),

  documentRequestDenied: (data: {
    name: string;
    email: string;
    documentName: string;
    reason?: string;
  }) => ({
    subject: "Document access request update",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document Access Request Update</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
            .reason { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .label { font-weight: 600; color: #1e293b; }
            .button { display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <div class="warning">
                <h1 style="color: #dc2626; margin-bottom: 10px;">Document Access Request Update</h1>
              </div>
              <p>Dear ${data.name},</p>
              <p>After review, we are unable to approve your request for access to <strong>"${data.documentName}"</strong>.</p>
              ${data.reason ? `<div class="reason"><span class="label">Reason:</span> ${data.reason}</div>` : ""}
              <p>If you believe this decision was made in error or have additional information to provide, please contact us at <a href="mailto:security@descope.com" style="color: #7C3AED;">security@descope.com</a>.</p>
              <p>Best regards,<br>The Descope Trust Center Team</p>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Document Access Request Update\n\nDear ${data.name},\n\nAfter review, we are unable to approve your request for access to "${data.documentName}".\n\n${data.reason ? `Reason: ${data.reason}\n\n` : ""}If you believe this decision was made in error or have additional information to provide, please contact us at security@descope.com.\n\nBest regards,\nThe Descope Trust Center Team`,
  }),

  subprocessorSubscriptionConfirmation: (_email: string) => ({
    subject: "Subprocessor updates subscription confirmed",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subscription Confirmed</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
            .unsubscribe { font-size: 12px; color: #64748b; margin-top: 20px; }
            .unsubscribe a { color: #7C3AED; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12 12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <div class="success">
                <h1 style="color: #065f46; margin-bottom: 10px;">Subscription Confirmed</h1>
              </div>
              <p>You have successfully subscribed to subprocessor update notifications.</p>
              <p>You will receive email notifications when Descope adds or removes third-party vendors that process customer data.</p>
              <div class="unsubscribe">
                <a href="https://descope.com/trust-center/subprocessors/unsubscribe?email=${encodeURIComponent(_email)}">Unsubscribe from these notifications</a>
              </div>
              <p>Best regards,<br>The Descope Trust Center Team</p>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Subscription Confirmed\n\nYou have successfully subscribed to subprocessor update notifications.\n\nYou will receive email notifications when Descope adds or removes third-party vendors that process customer data.\n\nUnsubscribe: https://descope.com/trust-center/subprocessors/unsubscribe?email=${encodeURIComponent(_email)}\n\nBest regards,\nThe Descope Trust Center Team`,
  }),

  subprocessorUpdateNotification: (data: {
    email: string;
    updates: {
      action: "added" | "removed";
      vendor: string;
      purpose: string;
      location: string;
    }[];
  }) => ({
    subject: "Subprocessor list updated",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subprocessor List Updated</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 140px; height: 32px; margin: 0 auto 20px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .update { margin: 15px 0; padding: 15px; border-radius: 8px; }
            .added { background: #d1fae5; border-left: 4px solid #10b981; }
            .removed { background: #fef2f2; border-left: 4px solid #ef4444; }
            .update-title { font-weight: 600; margin-bottom: 8px; }
            .added .update-title { color: #065f46; }
            .removed .update-title { color: #dc2626; }
            .unsubscribe { font-size: 12px; color: #64748b; margin-top: 30px; }
            .unsubscribe a { color: #7C3AED; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg class="logo" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="descope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#f0f0ff"/>
                  </linearGradient>
                </defs>
                <path d="M4 4h12c6.627 0 12 5.373 12 12s-5.373 12-12 12H4V4zm4 4v16h8c4.418 0 8-3.582 8-8s-3.582-8-8-8H8z" fill="url(#descope-gradient)"/>
                <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white">descope</text>
              </svg>
            </div>
            <div class="content">
              <h1 style="color: #1e293b; margin-bottom: 20px;">Subprocessor List Updated</h1>
              <p>Descope has updated its list of third-party vendors that process customer data:</p>
              ${data.updates
                .map(
                  (update) => `
                <div class="update ${update.action}">
                  <div class="update-title">${update.action === "added" ? "➕ Added" : "➖ Removed"}: ${update.vendor}</div>
                  <div><strong>Purpose:</strong> ${update.purpose}</div>
                  <div><strong>Location:</strong> ${update.location}</div>
                </div>
              `,
                )
                .join("")}
              <p>For the complete and current list of subprocessors, visit our <a href="https://descope.com/trust-center/subprocessors" style="color: #7C3AED;">Trust Center</a>.</p>
              <div class="unsubscribe">
                <a href="https://descope.com/trust-center/subprocessors/unsubscribe?email=${encodeURIComponent(data.email)}">Unsubscribe from these notifications</a>
              </div>
              <p>Best regards,<br>The Descope Trust Center Team</p>
            </div>
            <div class="footer">
              <p>Descope Trust Center | <a href="https://descope.com/trust-center" style="color: #7C3AED;">descope.com/trust-center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Subprocessor List Updated\n\nDescope has updated its list of third-party vendors that process customer data:\n\n${data.updates.map((update) => `${update.action === "added" ? "Added" : "Removed"}: ${update.vendor}\nPurpose: ${update.purpose}\nLocation: ${update.location}\n\n`).join("")}For the complete and current list of subprocessors, visit: https://descope.com/trust-center/subprocessors\n\nUnsubscribe: https://descope.com/trust-center/subprocessors/unsubscribe?email=${encodeURIComponent(data.email)}\n\nBest regards,\nThe Descope Trust Center Team`,
  }),
};
