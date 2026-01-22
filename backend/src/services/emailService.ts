import nodemailer from "nodemailer";

// Create Nodemailer transporter with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
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
    console.log("📧 Sending email via Gmail/Nodemailer...");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("📌 Email user:", process.env.EMAIL_USER);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    };

    const response = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully - ID:", response.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
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
