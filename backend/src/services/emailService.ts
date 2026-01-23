import Mailgun from "mailgun.js";
import FormData from "form-data";

// Initialize Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log("📧 Attempting to send email via Mailgun...");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);

    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.error("❌ MAILGUN_API_KEY or MAILGUN_DOMAIN not configured");
      return false;
    }

    const mailData = {
      from: `Digital Agreement <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      mailData
    );

    console.log("✅ Email sent via Mailgun");
    console.log("📬 Message ID:", response.id);
    return true;
  } catch (error: any) {
    console.error("❌ Mailgun email error:", error.message);
    console.error("Error details:", error);
    return false;
  }
}

/* ---------------- HELPERS ---------------- */

export function generateSigningLink(agreementId: number): string {
  const baseUrl = process.env.FRONTEND_URL;
  if (!baseUrl) {
    throw new Error('FRONTEND_URL environment variable is not set');
  }
  return `${baseUrl}/sign/${agreementId}`;
}

export function generateAgreementEmailBody(
  recipientName: string,
  senderName: string,
  agreementTitle: string,
  signingLink: string
): string {
  return `
  <p>Hello <strong>${recipientName}</strong>,</p>

  <p>
    <strong>${senderName}</strong> has created an agreement titled
    <strong>"${agreementTitle}"</strong> using the Digital Consent & Agreement Tracker.
  </p>

  <p>Please review and sign the agreement using the link below:</p>

  <p style="text-align:center;">
    <a href="${signingLink}"
       style="background:#4f46e5;color:#fff;padding:12px 24px;
       text-decoration:none;border-radius:6px;font-weight:bold;">
       👉 Sign Agreement
    </a>
  </p>

  <p>
    Once signed, a final copy will be emailed to both parties.
  </p>

  <p style="font-size:12px;color:#888;">
    This is an automated message. Please do not reply.
  </p>
  `;
}

export function generateSignedEmailBody(
  recipientName: string,
  agreementTitle: string
): string {
  return `
  <p>Hello <strong>${recipientName}</strong>,</p>

  <p>
    The agreement titled <strong>"${agreementTitle}"</strong> has been successfully signed.
  </p>

  <p>The signed PDF is attached for your records. </p>

  <p style="font-size:12px;color:#888;">
    Digital Consent & Agreement Tracker — automated email
  </p>
  `;
}
export function generateRejectionEmailBody(
  creatorName: string,
  recipientName: string,
  agreementTitle: string
): string {
  return `
    <p>Hello <strong>${creatorName}</strong>,</p>

    <p>
      The agreement titled <strong>"${agreementTitle}"</strong> was rejected
      by <strong>${recipientName}</strong>.
    </p>

    <p>
      You can log in to your dashboard to review the agreement details
      and take further action.
    </p>

    <p style="font-size:12px;color:#888;">
      Digital Consent & Agreement Tracker<br/>
      This is an automated message. Please do not reply.
    </p>
  `;
}
