import { Request, Response } from 'express';
import { getDatabase } from '../models/database';
import { sendEmail, generateSigningLink, generateAgreementEmailBody, generateRejectionEmailBody, generateSignedEmailBody } from '../services/emailService';
import { generateUnsignedPDF, generateSignedPDF } from '../services/pdfService';
import { createNotification } from './notificationController';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export async function createAgreement(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      agreementType,
      title,
      startDate,
      endDate,
      termsConditions,
      paymentAmount,
      jurisdiction,
      recipientName,
      recipientEmail
    } = req.body;

    // Validation
    if (
      !agreementType ||
      !title ||
      !startDate ||
      !endDate ||
      !termsConditions ||
      !paymentAmount ||
      !jurisdiction ||
      !recipientName ||
      !recipientEmail
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (endDateObj <= startDateObj) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Validate payment amount
    if (isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      return res.status(400).json({ message: 'Payment amount must be a positive number' });
    }

    // Insert agreement into database
    const result = await db.run(
      `INSERT INTO agreements (
        creator_id,
        title,
        agreement_type,
        start_date,
        end_date,
        terms_conditions,
        payment_amount,
        jurisdiction,
        recipient_name,
        recipient_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        agreementType,
        startDate,
        endDate,
        termsConditions,
        paymentAmount,
        jurisdiction,
        recipientName,
        recipientEmail
      ]
    );

    console.log(`✅ Agreement inserted. Result:`, result);
    console.log(`   lastID:`, result.lastID);
    console.log(`   changes:`, result.changes);

    // Fetch the created agreement
    const agreement = await db.get(
      'SELECT * FROM agreements WHERE id = ?',
      [result.lastID]
    );

    console.log(`📋 Created agreement retrieved:`, agreement);

    return res.status(201).json({
      message: 'Agreement created successfully',
      agreement
    });
  } catch (error) {
    console.error('Error creating agreement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAgreements(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const agreements = await db.all(
      'SELECT * FROM agreements WHERE creator_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({
      message: 'Agreements retrieved successfully',
      agreements
    });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAgreementById(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;
    const { id } = req.params;
    const agreementId = parseInt(id, 10);  // Convert string to integer

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const agreement = await db.get(
      'SELECT * FROM agreements WHERE id = ? AND creator_id = ?',
      [agreementId, userId]
    );

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    return res.status(200).json({
      message: 'Agreement retrieved successfully',
      agreement
    });
  } catch (error) {
    console.error('Error fetching agreement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateAgreement(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;
    const { id } = req.params;
    const agreementId = parseInt(id, 10);  // Convert string to integer

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if agreement exists and belongs to user
    const agreement = await db.get(
      'SELECT * FROM agreements WHERE id = ? AND creator_id = ?',
      [agreementId, userId]
    );

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    const {
      agreementType,
      startDate,
      endDate,
      termsConditions,
      paymentAmount,
      jurisdiction,
      recipientName,
      recipientEmail,
      status
    } = req.body;

    // Update agreement
    await db.run(
      `UPDATE agreements SET
        agreement_type = COALESCE(?, agreement_type),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        terms_conditions = COALESCE(?, terms_conditions),
        payment_amount = COALESCE(?, payment_amount),
        jurisdiction = COALESCE(?, jurisdiction),
        recipient_name = COALESCE(?, recipient_name),
        recipient_email = COALESCE(?, recipient_email),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        agreementType || null,
        startDate || null,
        endDate || null,
        termsConditions || null,
        paymentAmount || null,
        jurisdiction || null,
        recipientName || null,
        recipientEmail || null,
        status || null,
        agreementId
      ]
    );

    const updatedAgreement = await db.get(
      'SELECT * FROM agreements WHERE id = ?',
      [agreementId]
    );

    return res.status(200).json({
      message: 'Agreement updated successfully',
      agreement: updatedAgreement
    });
  } catch (error) {
    console.error('Error updating agreement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteAgreement(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;
    const { id } = req.params;
    const agreementId = parseInt(id, 10);  // Convert string to integer

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if agreement exists and belongs to user
    const agreement = await db.get(
      'SELECT * FROM agreements WHERE id = ? AND creator_id = ?',
      [agreementId, userId]
    );

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Delete related records first (cascade delete)
    await db.run('DELETE FROM signatures WHERE agreement_id = ?', [agreementId]);
    await db.run('DELETE FROM audit_logs WHERE agreement_id = ?', [agreementId]);
    await db.run('DELETE FROM notifications WHERE agreement_id = ?', [agreementId]);

    // Delete agreement
    await db.run('DELETE FROM agreements WHERE id = ?', [agreementId]);

    return res.status(200).json({ message: 'Agreement deleted successfully' });
  } catch (error) {
    console.error('Error deleting agreement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
export async function sendAgreement(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;
    const creatorName = req.user?.name || 'Unknown';
    const creatorEmail = req.user?.email || 'unknown@example.com';
    const { id } = req.params;
    const agreementId = parseInt(id, 10);  // Convert string to integer

    console.log('📤 sendAgreement called for agreement:', agreementId);
    console.log('   User ID:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get agreement
    const agreement = await db.get(
      'SELECT * FROM agreements WHERE id = ? AND creator_id = ?',
      [agreementId, userId]
    );

    console.log('   Agreement found:', !!agreement);
    console.log('   Agreement status:', agreement?.status);

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Check if already sent
    if (agreement.status !== 'draft') {
      console.log('❌ Agreement status is not draft:', agreement.status);
      return res.status(400).json({ message: 'Agreement can only be sent from draft status' });
    }

    // Generate unsigned PDF
    let pdfBuffer: Buffer;
    try {
      console.log('🔄 Generating PDF...');
      pdfBuffer = await generateUnsignedPDF(agreement, { name: creatorName, email: creatorEmail });
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      return res.status(500).json({ message: 'Failed to generate PDF' });
    }

    // Generate signing link
    const signingLink = generateSigningLink(agreement.id);

    // Prepare email
    const emailBody = generateAgreementEmailBody(
      agreement.recipient_name,
      creatorName,
      agreement.agreement_type,
      signingLink
    );

    // Send email with PDF
    const emailSent = await sendEmail({
      to: agreement.recipient_email,
      subject: `Agreement for Review: ${agreement.agreement_type}`,
      html: emailBody,
      attachments: [
        {
          filename: `Agreement_${agreement.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send email' });
    }

    // Update agreement status to pending and store PDF in database
    try {
      console.log('📝 Updating agreement status to pending...');
      await db.run(
        `UPDATE agreements SET 
          status = 'pending', 
          sent_at = CURRENT_TIMESTAMP,
          pdf_url = ?,
          unsigned_pdf_content = ?
        WHERE id = ?`,
        [`agreement_${agreement.id}_unsigned.pdf`, pdfBuffer, agreementId]
      );
      console.log('✅ Agreement status updated to pending');
    } catch (updateError) {
      console.error('❌ Failed to update agreement status:', updateError);
      return res.status(500).json({ message: 'Email sent but failed to update agreement status' });
    }

    // Create audit log entry
    try {
      await db.run(
        `INSERT INTO audit_logs (agreement_id, action, performed_by, timestamp)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [agreementId, 'sent', req.user?.email || 'unknown']
      );
    } catch (auditError) {
      console.error('⚠️  Failed to create audit log:', auditError);
      // Don't fail the request just for audit logging
    }

    // Create notification for agreement creator
    try {
      await createNotification(
        agreement.creator_id,
        agreement.id,
        'sent',
        'Agreement Sent',
        `Your agreement "${agreement.title}" was sent to ${agreement.recipient_name}.`
      );
    } catch (notifError) {
      console.error('⚠️  Failed to create notification:', notifError);
    }

    const updatedAgreement = await db.get('SELECT * FROM agreements WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Agreement sent successfully',
      agreement: updatedAgreement
    });
  } catch (error) {
    console.error('Error sending agreement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function signAgreement(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const agreementId = parseInt(id, 10);  // Convert string to integer
    const { signer_name, signature_type, signature_data } = req.body;

    if (!signer_name || !signature_type || !signature_data) {
      return res.status(400).json({ message: 'Missing required signature fields' });
    }

    // Validate signature type
    if (!['typed', 'drawn', 'uploaded'].includes(signature_type)) {
      return res.status(400).json({ message: 'Invalid signature type' });
    }

    // Get agreement (no authentication check for public signing page)
    const agreement = await db.get('SELECT * FROM agreements WHERE id = ?', [agreementId]);

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Check if status is pending
    if (agreement.status !== 'pending') {
      return res.status(400).json({ message: 'Agreement is not pending signature' });
    }

    // Get creator info for signed PDF
    const creator = await db.get('SELECT name, email FROM users WHERE id = ?', agreement.creator_id);
    const creatorName = creator?.name || 'Unknown';
    const creatorEmail = creator?.email || 'unknown@example.com';

    // Generate signed PDF
    let signedPdfBuffer: Buffer;
    try {
      const signatureRecord = {
        signer_name,
        signature_type,
        signature_data,
        signed_at: new Date().toISOString(),
        ip_address: req.ip || 'unknown'
      };
      signedPdfBuffer = await generateSignedPDF(agreement, signatureRecord, { name: creatorName, email: creatorEmail });
    } catch (pdfError) {
      console.error('Signed PDF generation error:', pdfError);
      return res.status(500).json({ message: 'Failed to generate signed PDF' });
    }

    // Save signature record
    await db.run(
      `INSERT INTO signatures (agreement_id, signer_name, signature_type, signature_data, ip_address, signed_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [agreementId, signer_name, signature_type, signature_data, req.ip || 'unknown']
    );

    // Update agreement status to signed and store PDF in database
    await db.run(
      `UPDATE agreements SET 
        status = 'signed', 
        signed_at = CURRENT_TIMESTAMP,
        signed_pdf_url = ?,
        signed_pdf_content = ?
      WHERE id = ?`,
      [`agreement_${agreement.id}_signed.pdf`, signedPdfBuffer, agreementId]
    );

    // Create audit log entry
    await db.run(
      `INSERT INTO audit_logs (agreement_id, action, performed_by, timestamp)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [agreementId, 'signed', signer_name]
    );

    // Send email to creator
    const creatorUser = await db.get('SELECT email FROM users WHERE id = ?', [agreement.creator_id]);
    if (creatorUser) {
      const creatorEmailBody = generateSignedEmailBody(creatorName, agreement.agreement_type);
      
      try {
        await sendEmail({
          to: creatorUser.email,
          subject: `Agreement Signed: ${agreement.agreement_type}`,
          html: creatorEmailBody,
          attachments: [
            {
              filename: `agreement_${agreement.id}_signed.pdf`,
              content: signedPdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
      } catch (error) {
        console.error('Error sending creator email:', error);
      }
    }

    // Send email to recipient
    const recipientEmailBody = generateSignedEmailBody(agreement.recipient_name, agreement.agreement_type);
    
    try {
      await sendEmail({
        to: agreement.recipient_email,
        subject: `Agreement Signed: ${agreement.agreement_type}`,
        html: recipientEmailBody,
        attachments: [
          {
            filename: `agreement_${agreement.id}_signed.pdf`,
            content: signedPdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
    } catch (error) {
      console.error('Error sending recipient email:', error);
    }

    // Create notifications for agreement creator
    try {
      await createNotification(
        agreement.creator_id,
        agreement.id,
        'signed',
        'Agreement Signed',
        `Your agreement "${agreement.title}" has been signed by ${agreement.recipient_name}.`
      );
      await createNotification(
        agreement.creator_id,
        agreement.id,
        'pdf_ready',
        'Signed Document Ready',
        `The signed PDF for "${agreement.title}" is now available in Documents.`
      );
    } catch (notifError) {
      console.error('⚠️  Failed to create notifications:', notifError);
    }

    const updatedAgreement = await db.get('SELECT * FROM agreements WHERE id = ?', [agreementId]);

    return res.status(200).json({
      message: 'Agreement signed successfully',
      agreement: updatedAgreement
    });
  } catch (error) {
    console.error('Error signing agreement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function rejectAgreement(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const agreementId = parseInt(id, 10);  // Convert string to integer
    const { rejection_reason } = req.body;

    // Get agreement
    const agreement = await db.get('SELECT * FROM agreements WHERE id = ?', [agreementId]);

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Check if status is pending
    if (agreement.status !== 'pending') {
      return res.status(400).json({ message: 'Agreement is not pending signature' });
    }

    // Update agreement status to rejected
    await db.run(
      `UPDATE agreements SET 
        status = 'rejected', 
        rejected_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [agreementId]
    );

    // Create audit log entry
    await db.run(
      `INSERT INTO audit_logs (agreement_id, action, performed_by, timestamp)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [agreementId, 'rejected', agreement.recipient_name]
    );

    // Send email to creator about rejection
    const creator = await db.get('SELECT name, email FROM users WHERE id = ?', agreement.creator_id);
    if (creator) {
      const rejectionEmailBody = generateRejectionEmailBody(
        creator.name,
        agreement.recipient_name,
        agreement.agreement_type
      );

      try {
        await sendEmail({
          to: creator.email,
          subject: `Agreement Rejected: ${agreement.agreement_type}`,
          html: rejectionEmailBody
        });
      } catch (error) {
        console.error('Error sending rejection email:', error);
      }
    }

    // Create notification for agreement creator
    try {
      await createNotification(
        agreement.creator_id,
        agreement.id,
        'rejected',
        'Agreement Rejected',
        `Your agreement "${agreement.title}" was rejected by ${agreement.recipient_name}.`
      );
    } catch (notifError) {
      console.error('⚠️  Failed to create notification:', notifError);
    }

    const updatedAgreement = await db.get('SELECT * FROM agreements WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Agreement rejected successfully',
      agreement: updatedAgreement
    });
  } catch (error) {
    console.error('Error rejecting agreement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSignedDocuments(req: AuthRequest, res: Response) {
  try {
    const db = getDatabase();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // ✅ SECURITY FIX: Only show documents where user is the CREATOR (owns the document)
    // Recipients should NOT see the creator's signed documents through this endpoint
    // Recipients receive copies via email instead
    const agreements = await db.all(
      `SELECT * FROM agreements 
       WHERE status = 'signed' 
       AND creator_id = ?
       ORDER BY signed_at DESC`,
      [userId]
    );

    return res.status(200).json({
      message: 'Signed documents retrieved successfully',
      agreements: agreements || []
    });
  } catch (error) {
    console.error('Error retrieving signed documents:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAgreementForSigning(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const agreementId = parseInt(id, 10);  // Convert string to integer

    // Get agreement without authentication check
    const agreement = await db.get('SELECT * FROM agreements WHERE id = ?', [agreementId]);

    console.log(`📋 getAgreementForSigning called for ID: ${id} (parsed: ${agreementId})`);
    console.log(`   Agreement found:`, !!agreement);
    if (agreement) {
      console.log(`   Status in DB: "${agreement.status}"`);
      console.log(`   Full agreement object:`, agreement);
    }

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Check if agreement can be signed
    if (agreement.status !== 'pending' && agreement.status !== 'draft') {
      console.log(`   ⚠️ Agreement status is '${agreement.status}', not pending or draft`);
    }

    // Return agreement but hide creator details
    return res.status(200).json({
      message: 'Agreement retrieved successfully',
      agreement: {
        id: agreement.id,
        agreement_type: agreement.agreement_type,
        terms_conditions: agreement.terms_conditions,
        payment_amount: agreement.payment_amount,
        jurisdiction: agreement.jurisdiction,
        recipient_name: agreement.recipient_name,
        status: agreement.status,
        created_at: agreement.created_at
      }
    });
  } catch (error) {
    console.error('Error retrieving agreement for signing:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getPDF(req: Request, res: Response) {
  try {
    const db = getDatabase();
    const { id, type } = req.params;
    const agreementId = parseInt(id, 10);

    // Validate type parameter
    if (!['unsigned', 'signed'].includes(type)) {
      return res.status(400).json({ message: 'Invalid PDF type. Must be "unsigned" or "signed"' });
    }

    // Get agreement
    const agreement = await db.get(
      'SELECT * FROM agreements WHERE id = ?',
      [agreementId]
    );

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Get the appropriate PDF content from database
    let pdfContent: Buffer;
    let fileName: string;

    if (type === 'unsigned') {
      pdfContent = agreement.unsigned_pdf_content;
      fileName = `agreement_${agreement.id}_unsigned.pdf`;
    } else {
      pdfContent = agreement.signed_pdf_content;
      fileName = `agreement_${agreement.id}_signed.pdf`;
    }

    // Check if PDF content exists in database
    if (!pdfContent) {
      return res.status(404).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} PDF not found` });
    }

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfContent.length);

    // Send PDF content
    return res.send(pdfContent);
  } catch (error) {
    console.error('Error retrieving PDF:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}