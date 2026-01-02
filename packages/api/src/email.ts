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
      <h1>Thank you for reaching out, ${name}!</h1>
      <p>We have received your message and will get back to you within 24 hours.</p>
      <p>Best regards,<br>The Descope Trust Center Team</p>
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
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company ?? "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, "<br>")}</p>
    `,
    text: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || "Not provided"}\nMessage:\n${data.message}`,
  }),

  documentRequestConfirmation: (data: {
    name: string;
    email: string;
    company?: string;
    reason: string;
  }) => ({
    subject: "Document access request received",
    html: `
      <h1>Document Access Request Received</h1>
      <p>Dear ${data.name},</p>
      <p>We have received your request for document access. Our security team will review your request and respond within 3-5 business days.</p>
      <p><strong>Request Details:</strong></p>
      <ul>
        <li>Name: ${data.name}</li>
        <li>Email: ${data.email}</li>
        <li>Company: ${data.company || "Not provided"}</li>
        <li>Reason: ${data.reason}</li>
      </ul>
      <p>Best regards,<br>The Descope Trust Center Team</p>
    `,
    text: `Document Access Request Received\n\nDear ${data.name},\n\nWe have received your request for document access. Our security team will review your request and respond within 3-5 business days.\n\nRequest Details:\n- Name: ${data.name}\n- Email: ${data.email}\n- Company: ${data.company || "Not provided"}\n- Reason: ${data.reason}\n\nBest regards,\nThe Descope Trust Center Team`,
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
      <h1>New Document Access Request</h1>
      <p><strong>Document ID:</strong> ${data.documentId}</p>
      <p><strong>Requester:</strong> ${data.name} (${data.email})</p>
      <p><strong>Company:</strong> ${data.company ?? "Not provided"}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p>Please review this request in the admin dashboard.</p>
    `,
    text: `New Document Access Request\n\nDocument ID: ${data.documentId}\nRequester: ${data.name} (${data.email})\nCompany: ${data.company || "Not provided"}\nReason: ${data.reason}\n\nPlease review this request in the admin dashboard.`,
  }),

  documentRequestApproved: (data: {
    name: string;
    email: string;
    documentName: string;
    downloadLink: string;
  }) => ({
    subject: "Document access approved",
    html: `
      <h1>Document Access Approved</h1>
      <p>Dear ${data.name},</p>
      <p>Your request for access to "${data.documentName}" has been approved.</p>
      <p><a href="${data.downloadLink}">Click here to download the document</a></p>
      <p>This link will expire in 7 days.</p>
      <p>Best regards,<br>The Descope Trust Center Team</p>
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
      <h1>Document Access Request Update</h1>
      <p>Dear ${data.name},</p>
      <p>After review, we are unable to approve your request for access to "${data.documentName}".</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
      <p>If you believe this decision was made in error or have additional information to provide, please contact us at security@descope.com.</p>
      <p>Best regards,<br>The Descope Trust Center Team</p>
    `,
    text: `Document Access Request Update\n\nDear ${data.name},\n\nAfter review, we are unable to approve your request for access to "${data.documentName}".\n\n${data.reason ? `Reason: ${data.reason}\n\n` : ""}If you believe this decision was made in error or have additional information to provide, please contact us at security@descope.com.\n\nBest regards,\nThe Descope Trust Center Team`,
  }),

  subprocessorSubscriptionConfirmation: (_email: string) => ({
    subject: "Subprocessor updates subscription confirmed",
    html: `
      <h1>Subscription Confirmed</h1>
      <p>You have successfully subscribed to subprocessor update notifications.</p>
      <p>You will receive email notifications when Descope adds or removes third-party vendors that process customer data.</p>
      <p>If you wish to unsubscribe, please contact us at privacy@descope.com.</p>
      <p>Best regards,<br>The Descope Trust Center Team</p>
    `,
    text: `Subscription Confirmed\n\nYou have successfully subscribed to subprocessor update notifications.\n\nYou will receive email notifications when Descope adds or removes third-party vendors that process customer data.\n\nIf you wish to unsubscribe, please contact us at privacy@descope.com.\n\nBest regards,\nThe Descope Trust Center Team`,
  }),
};
