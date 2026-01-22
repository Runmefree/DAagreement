import express, { Router } from 'express';
import { authMiddleware } from '../middleware/requireAuth';
import {
  createAgreement,
  getAgreements,
  getAgreementById,
  updateAgreement,
  deleteAgreement,
  sendAgreement,
  signAgreement,
  rejectAgreement,
  getAgreementForSigning,
  getSignedDocuments,
  getPDF
} from '../controllers/agreementController';

const router: Router = express.Router();

// Public routes (no authentication required) - MUST come before authMiddleware
router.get('/sign/:id', getAgreementForSigning);
router.post('/sign/:id/sign', signAgreement);
router.post('/sign/:id/reject', rejectAgreement);
router.get('/pdf/:id/:type', getPDF);

// Protected routes (authentication required)
router.use(authMiddleware);

// Get signed documents
router.get('/documents/signed', getSignedDocuments);

// Create a new agreement
router.post('/', createAgreement);

// Get all agreements for the current user
router.get('/', getAgreements);

// Get a specific agreement by ID
router.get('/:id', getAgreementById);

// Update an agreement
router.put('/:id', updateAgreement);

// Delete an agreement
router.delete('/:id', deleteAgreement);

// Send an agreement to recipient
router.post('/:id/send', sendAgreement);

export default router;
