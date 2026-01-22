import PDFDocument from 'pdfkit';
import crypto from 'crypto';

export interface AgreementData {
  id: number;
  title: string;
  agreement_type: string;
  terms_conditions: string;
  payment_amount: string;
  jurisdiction: string;
  recipient_name: string;
  recipient_email: string;
  start_date?: string;
  end_date?: string;
  creator_id: number;
  created_at: string;
}

export interface CreatorData {
  name: string;
  email: string;
}

export interface SignatureData {
  signer_name: string;
  signature_type: string;
  signature_data: string; // Base64 or image data
  signed_at: string;
  ip_address: string;
}

// Helper: Generate document hash
function generateDocumentHash(agreementId: number, signerName: string, timestamp: string): string {
  const hashInput = `${agreementId}:${signerName}:${timestamp}`;
  return crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16).toUpperCase();
}

// Helper: Convert base64 to buffer
function base64ToBuffer(base64String: string): Buffer {
  if (base64String.startsWith('data:')) {
    // Remove the data URI prefix
    base64String = base64String.split(',')[1];
  }
  return Buffer.from(base64String, 'base64');
}

// Helper: Add divider line
function addDivider(doc: any, yOffset = 0.3, color = '#d0d0d0') {
  doc.moveDown(yOffset);
  doc.strokeColor(color).lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.2);
}

// Helper: Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Helper: Format date with time
function formatDateWithTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + 
         ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export async function generateSignedPDF(
  agreement: AgreementData,
  signature: SignatureData,
  creator: CreatorData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const doc = new PDFDocument({ margin: 40, size: 'Letter' });

    // Collect PDF data into buffer
    doc.on('data', (chunk: Buffer) => {
      buffers.push(chunk);
    });

    try {
      const documentHash = generateDocumentHash(agreement.id, signature.signer_name, signature.signed_at);
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 80;

      // ===== HEADER =====
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text('DIGITAL AGREEMENT', {
        align: 'center'
      });
      doc.fontSize(11).font('Helvetica').fillColor('#333333').text('Digital Consent & Agreement Tracker', {
        align: 'center'
      });
      doc.fontSize(9).font('Helvetica').fillColor('#666666').text('(Electronically Generated & Signed Document)', {
        align: 'center'
      });
      doc.moveDown(0.4);

      // ===== TABLE WITH AGREEMENT INFO =====
      const tableY = doc.y;
      const tableX = 40;
      const tableWidth = pageWidth - 80;
      const rowHeight = 20;
      const col1Width = 150;
      const col2Width = tableWidth - col1Width;

      // Draw table border and cells
      doc.strokeColor('#000000').lineWidth(1);
      
      // Outer border
      doc.rect(tableX, tableY, tableWidth, rowHeight * 3).stroke();
      
      // Horizontal lines
      doc.moveTo(tableX, tableY + rowHeight).lineTo(tableX + tableWidth, tableY + rowHeight).stroke();
      doc.moveTo(tableX, tableY + rowHeight * 2).lineTo(tableX + tableWidth, tableY + rowHeight * 2).stroke();
      
      // Vertical line
      doc.moveTo(tableX + col1Width, tableY).lineTo(tableX + col1Width, tableY + rowHeight * 3).stroke();

      // Row 1: Agreement Title
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('Agreement Title:', tableX + 5, tableY + 3);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(agreement.title.substring(0, 40), tableX + col1Width + 5, tableY + 3, { width: col2Width - 10 });

      // Row 2: Agreement ID
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('Agreement ID:', tableX + 5, tableY + rowHeight + 3);
      doc.fontSize(9).font('Courier').fillColor('#333333').text(agreement.id.toString(), tableX + col1Width + 5, tableY + rowHeight + 3);

      // Row 3: Document Hash ID
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('Document Hash ID:', tableX + 5, tableY + rowHeight * 2 + 3);
      doc.fontSize(9).font('Courier').fillColor('#666666').text(documentHash, tableX + col1Width + 5, tableY + rowHeight * 2 + 3);

      doc.y = tableY + rowHeight * 3 + 15;

      // ===== PARTIES TO THE AGREEMENT =====
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Parties to the Agreement', 40);
      doc.moveDown(0.2);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(`Party A (Creator): ${creator.name}`, 40);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(`Party B (Recipient): ${agreement.recipient_name}`, 40);
      doc.moveDown(0.3);

      // ===== TERMS AND CONDITIONS =====
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Terms and Conditions', 40);
      doc.moveDown(0.2);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(agreement.terms_conditions, 40, doc.y, {
        align: 'left',
        width: contentWidth,
        lineGap: 2
      });
      doc.moveDown(0.3);

      // ===== ACKNOWLEDGMENT & CONSENT =====
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Acknowledgment & Consent', 40);
      doc.moveDown(0.2);

      const acknowledgmentText = `I, ${agreement.recipient_name}, hereby acknowledge that I have read, understood, and agreed to all the terms and conditions stated in this agreement.

I understand that this agreement is executed electronically and that my digital signature constitutes a legally binding acceptance under applicable electronic transaction laws.`;

      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(acknowledgmentText, 40, doc.y, {
        align: 'left',
        width: contentWidth,
        lineGap: 2
      });
      doc.moveDown(0.3);

      // ===== LEGAL STATEMENT =====
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('LEGAL STATEMENT', 40);
      doc.moveDown(0.2);

      const legalStatement = `This agreement was created digitally by ${creator.name} (${creator.email}) using the Digital Consent & Agreement Tracker platform.

It was sent to ${agreement.recipient_name} (${agreement.recipient_email}). The recipient reviewed and digitally signed this agreement on ${formatDateWithTime(signature.signed_at)} from IP address ${signature.ip_address}.

This document is governed under the Information Technology Act, 2000 and applicable electronic transaction laws.

All agreement metadata is captured server-side at the time of creation and signing and embedded into this document as a permanent and tamper-resistant audit trail.`;

      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(legalStatement, 40, doc.y, {
        align: 'left',
        width: contentWidth,
        lineGap: 2
      });
      doc.moveDown(0.3);

      // ===== PAYMENT AMOUNT & JURISDICTION =====
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Payment Amount:', 40);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text('_'.repeat(50), 40);
      doc.moveDown(0.15);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Jurisdiction', 40);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text('This agreement is governed by the laws of ' + (agreement.jurisdiction || '______________'), 40);
      doc.moveDown(0.4);

      // ===== SIGNATURE SECTION WITH BOX ON RIGHT =====
      const signatureYStart = doc.y;
      
      // Left side: Signature details
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Signed By:', 40);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(signature.signer_name, 40, doc.y);
      doc.moveDown(0.25);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Signature Method:', 40);
      const sigMethod = signature.signature_type === 'typed' ? 'Typed' : signature.signature_type === 'drawn' ? 'Drawn' : 'Uploaded';
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(sigMethod, 40);
      doc.moveDown(0.25);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Signed On:', 40);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(formatDateWithTime(signature.signed_at), 40);
      doc.moveDown(0.25);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('IP Address:', 40);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(signature.ip_address, 40);
      doc.moveDown(0.3);

      // Right side: Signature box - positioned higher on same section
      const sigBoxX = 330;
      const sigBoxY = signatureYStart;
      const sigBoxWidth = 200;
      const sigBoxHeight = 90;

      // Draw border box
      doc.strokeColor('#000000').lineWidth(1).rect(sigBoxX, sigBoxY, sigBoxWidth, sigBoxHeight).stroke();

      // Try to embed signature
      if (signature.signature_type === 'typed') {
        // Typed: name in cursive font
        doc.fontSize(36).font('Helvetica-Oblique').fillColor('#000000').text(
          signature.signer_name,
          sigBoxX + 10,
          sigBoxY + 25,
          { width: sigBoxWidth - 20, align: 'center' }
        );
      } else if (signature.signature_type === 'drawn' || signature.signature_type === 'uploaded') {
        // Drawn or Uploaded: embed image
        if (signature.signature_data) {
          try {
            const sigBuffer = base64ToBuffer(signature.signature_data);
            doc.image(sigBuffer, sigBoxX + 5, sigBoxY + 5, {
              width: sigBoxWidth - 10,
              height: sigBoxHeight - 10,
              fit: [sigBoxWidth - 10, sigBoxHeight - 10]
            });
          } catch (err) {
            console.error(`Failed to embed ${signature.signature_type} signature:`, err);
            // Fallback text
            doc.fontSize(9).font('Helvetica').fillColor('#666666').text(
              `[${signature.signature_type} Signature]`,
              sigBoxX + 10,
              sigBoxY + 40,
              { width: sigBoxWidth - 20, align: 'center' }
            );
          }
        }
      }

      doc.y = sigBoxY + sigBoxHeight + 10;
      doc.moveDown(0.3);

      // ===== FINAL LEGAL VALIDITY DECLARATION =====
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text(
        'FINAL LEGAL VALIDITY DECLARATION',
        40,
        doc.y,
        { align: 'left', width: contentWidth }
      );
      doc.moveDown(0.2);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(
        'This document has been digitally signed and is legally binding under the Information Technology Act, 2000.',
        40,
        doc.y,
        { align: 'left', width: contentWidth }
      );
      doc.moveDown(0.3);

      // ===== FOOTER =====
      doc.fontSize(8).font('Helvetica').fillColor('#888888').text(
        `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Agreement ID: ${agreement.id} | Digital Consent & Agreement Tracker`,
        40,
        doc.y,
        { align: 'left', width: contentWidth }
      );

      doc.end();

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Unsigned PDF for preview (before signing)
export async function generateUnsignedPDF(agreement: AgreementData, creator: CreatorData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50, size: 'Letter' });

    doc.on('data', (chunk: Buffer) => {
      buffers.push(chunk);
    });

    try {
      const pageWidth = doc.page.width;

      // 1. HEADER (TOP CENTER, BOLD)
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#000000').text('DIGITAL AGREEMENT', {
        align: 'center'
      });
      doc.fontSize(11).font('Helvetica').fillColor('#333333').text('Digital Consent & Agreement Tracker', {
        align: 'center'
      });
      doc.fontSize(9).font('Helvetica').fillColor('#666666').text('(Electronically Generated & Signed Document)', {
        align: 'center'
      });
      doc.moveDown(0.5);

      // Subtle divider
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // 2. AGREEMENT INFO SECTION
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Agreement Title:', 50);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(agreement.title, 50, doc.y, { width: pageWidth - 100 });
      doc.moveDown(0.2);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Agreement ID:', 50);
      doc.fontSize(9).font('Courier').fillColor('#333333').text(`${agreement.id}`, 50);
      doc.moveDown(0.2);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Status:', 50);
      doc.fontSize(9).font('Helvetica').fillColor('#ff9800').text('PENDING - Awaiting Signature', 50);
      doc.moveDown(0.4);

      // Divider
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // 3. PARTIES TO THE AGREEMENT
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Parties to the Agreement');
      doc.moveDown(0.3);

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a1a1a').text('Party A (Creator)');
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(`${creator.name}`);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(`${creator.email}`);
      doc.moveDown(0.25);

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a1a1a').text('Party B (Recipient)');
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(`${agreement.recipient_name}`);
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(`${agreement.recipient_email}`);
      doc.moveDown(0.4);

      // Divider
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // 4. TERMS AND CONDITIONS
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Terms and Conditions');
      doc.moveDown(0.3);

      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(agreement.terms_conditions, {
        align: 'left',
        width: pageWidth - 100,
        lineGap: 3
      });
      doc.moveDown(0.4);

      // Divider
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // 5. ACKNOWLEDGMENT & CONSENT
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Acknowledgment & Consent');
      doc.moveDown(0.3);

      const acknowledgmentText = `I, ${agreement.recipient_name}, hereby acknowledge that I have read, understood, and agreed to all the terms and conditions stated in this agreement.

I understand that this agreement is executed electronically and that my digital signature constitutes a legally binding acceptance under applicable electronic transaction laws.`;

      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(acknowledgmentText, {
        align: 'left',
        width: pageWidth - 100,
        lineGap: 3
      });
      doc.moveDown(0.4);

      // Divider
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // 6. DIGITAL SIGNATURE SECTION - PLACEHOLDER
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Digital Signature');
      doc.moveDown(0.3);

      doc.fontSize(9).font('Helvetica').fillColor('#888888').text('Awaiting Client Signature');
      doc.moveDown(0.3);

      // Signature placeholder box
      const placeholderBoxX = 50;
      const placeholderBoxY = doc.y;
      const placeholderBoxWidth = 250;
      const placeholderBoxHeight = 90;

      doc.strokeColor('#cccccc').lineWidth(1).rect(placeholderBoxX, placeholderBoxY, placeholderBoxWidth, placeholderBoxHeight).stroke();
      doc.fontSize(10).font('Helvetica').fillColor('#999999').text(
        'Client signature will appear here after signing',
        placeholderBoxX + 10,
        placeholderBoxY + 35,
        { width: placeholderBoxWidth - 20, align: 'center' }
      );

      doc.y = placeholderBoxY + placeholderBoxHeight + 20;
      doc.moveDown(0.3);

      // Divider
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // 7. LEGAL STATEMENT (BOLD HEADING)
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Legal Statement');
      doc.moveDown(0.3);

      const legalStatement = `This agreement was created by ${creator.name} (${creator.email}) using the Digital Consent & Agreement Tracker platform and is awaiting digital signature from ${agreement.recipient_name} (${agreement.recipient_email}).

Once signed, this document will be governed under the Information Technology Act, 2000 and applicable electronic transaction laws.

All agreement metadata will be captured server-side at the time of signing and embedded into this document as a permanent and tamper-resistant audit trail.`;

      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(legalStatement, {
        align: 'left',
        width: pageWidth - 100,
        lineGap: 3
      });
      doc.moveDown(0.4);

      // Divider
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
      doc.moveDown(0.5);

      // 8. FINAL LEGAL VALIDITY DECLARATION (BOLD)
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#ff9800').text(
        'This document will be legally binding under the Information Technology Act, 2000 upon digital signature.',
        { align: 'center', width: pageWidth - 100 }
      );
      doc.moveDown(0.5);

      // 9. FOOTER (SUBTLE, SMALL TEXT)
      doc.fontSize(8).font('Helvetica').fillColor('#888888').text(
        `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        { align: 'center', width: pageWidth - 100 }
      );
      doc.fontSize(8).font('Helvetica').fillColor('#888888').text(
        `Agreement ID: ${agreement.id}`,
        { align: 'center', width: pageWidth - 100 }
      );
      doc.fontSize(8).font('Helvetica').fillColor('#888888').text(
        'Digital Consent & Agreement Tracker',
        { align: 'center', width: pageWidth - 100 }
      );

      doc.end();

      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      doc.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

