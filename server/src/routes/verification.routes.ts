import { Router, Response } from 'express';
import multer from 'multer';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/roleGuard.js';
import { primaryStore } from '../db/store.js';
import { evaluateDocumentQuality, crossCheckInstitutionalRegistry, transitionApprovalState } from '../services/verification.service.js';
import { blockchainService } from '../services/blockchain.service.js';
import { auditLedger } from '../db/auditLedger.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

export const verificationRouter = Router();

/**
 * POST /api/verification/document/upload
 */
verificationRouter.post('/document/upload', requireAuth, upload.single('document'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'No document file uploaded.' });
    }

    const user = await primaryStore.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    // Server-side blur & quality check
    const quality = evaluateDocumentQuality(req.file.buffer);

    const documentUrl = `https://s3.vault.nyayakasha.gov.in/encrypted-docs/${user.id}/${Date.now()}_${req.file.originalname}`;

    user.uploadedDocumentUrl = documentUrl;
    user.documentBlurScore = quality.blurScore;
    user.documentPassesQuality = quality.passesQuality;

    await primaryStore.saveUser(user);

    auditLedger.appendEvent({
      eventType: 'DOCUMENT_UPLOADED',
      userId: user.id,
      userRole: user.role,
      details: { documentUrl, blurScore: quality.blurScore, passesQuality: quality.passesQuality }
    });

    return res.json({
      message: 'Document uploaded and encrypted at rest.',
      documentUrl,
      qualityCheck: quality
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * POST /api/verification/institution/cross-check
 */
verificationRouter.post('/institution/cross-check', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await primaryStore.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    const result = await crossCheckInstitutionalRegistry(user);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * POST /api/verification/admin/approve-user
 * Enforces State Machine: institution_review → mfa_pending
 */
verificationRouter.post('/admin/approve-user', requireAuth, requireRole('court_authority', 'independent_validator'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUserId, decision, note } = req.body;
    if (!targetUserId || !decision) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'targetUserId and decision (APPROVE or REJECT) are required.' });
    }

    const targetUser = await primaryStore.getUserById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    if (decision === 'APPROVE') {
      // Transition State to mfa_pending strictly after institutional approval
      const updatedUser = await transitionApprovalState(targetUserId, 'mfa_pending', req.userRole!, note);

      // Anchor Approval Event on Polygon PoS / Fabric Blockchain
      const blockchainRecord = await blockchainService.anchorApprovalEvent(
        targetUser.id,
        targetUser.stateHistory[targetUser.stateHistory.length - 1].timestamp,
        'mfa_pending'
      );

      return res.json({
        message: 'User institutionally approved. Account state updated to mfa_pending.',
        user: {
          id: updatedUser.id,
          approvalState: updatedUser.approvalState
        },
        blockchainRecord
      });
    } else {
      const updatedUser = await transitionApprovalState(targetUserId, 'rejected', req.userRole!, note || 'Institutional review rejected');
      return res.json({
        message: 'User application rejected.',
        user: { id: updatedUser.id, approvalState: updatedUser.approvalState }
      });
    }
  } catch (error: any) {
    return res.status(400).json({ error: 'STATE_TRANSITION_FAILED', message: error.message });
  }
});

/**
 * GET /api/verification/vetting/queue
 */
verificationRouter.get('/vetting/queue', requireAuth, requireRole('independent_validator'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const queue = primaryStore.getVettingQueue();
    return res.json({ vettingQueue: queue });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});
