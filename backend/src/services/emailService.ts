import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Email Config:');
console.log('  USER:', process.env.EMAIL_USER);
console.log('  PASS:', process.env.EMAIL_PASSWORD ? '***hidden***' : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Test SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
    console.error('Error details:', error);
  } else {
    console.log('✅ SMTP Connection OK - Ready to send emails');
  }
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
    // Debug logging
    console.log('📧 Attempting to send email...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@agreement-tracker.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    });
    
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

export function generateSigningLink(agreementId: number): string {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/sign/${agreementId}`;
}

export function generateAgreementEmailBody(
  recipientName: string,
  senderName: string,
  agreementTitle: string,
  signingLink: string
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hello <strong>${recipientName}</strong>,</p>
        
        <p>
          <strong>${senderName}</strong> has created an agreement titled <strong>"${agreementTitle}"</strong>
          using the Digital Consent & Agreement Tracker platform.
        </p>
        
        <p>Please review the agreement details and sign it using the link below:</p>
        
        <div style="margin: 20px 0; text-align: center;">
          <a href="${signingLink}" 
             style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            👉 Sign Agreement
          </a>
        </div>
        
        <p>
          This agreement is managed digitally. Once signed, a final signed copy will be emailed to both parties for records.
        </p>
        
        <p>If you did not expect this email, you may safely ignore it.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        
        <p style="color: #999; font-size: 12px;">
          Digital Consent & Agreement Tracker<br/>
          This is an automated message. Please do not reply.
        </p>
      </body>
    </html>
  `;
}

export function generateRejectionEmailBody(
  creatorName: string,
  recipientName: string,
  agreementTitle: string
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hello <strong>${creatorName}</strong>,</p>
        
        <p>
          The agreement titled <strong>"${agreementTitle}"</strong> has been rejected by <strong>${recipientName}</strong>.
        </p>
        
        <p>You can log in to your dashboard to review the details and take further action.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        
        <p style="color: #999; font-size: 12px;">
          Digital Consent & Agreement Tracker<br/>
          This is an automated message. Please do not reply.
        </p>
      </body>
    </html>
  `;
}

export function generateSignedEmailBody(
  recipientName: string,
  agreementTitle: string
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hello <strong>${recipientName}</strong>,</p>
        
        <p>
          The agreement titled <strong>"${agreementTitle}"</strong> has been successfully signed.
        </p>
        
        <p>A signed copy has been attached to this email for your records.</p>
        
        <p>Thank you for using the Digital Consent & Agreement Tracker platform.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        
        <p style="color: #999; font-size: 12px;">
          Digital Consent & Agreement Tracker<br/>
          This is an automated message. Please do not reply.
        </p>
      </body>
    </html>
  `;
}
