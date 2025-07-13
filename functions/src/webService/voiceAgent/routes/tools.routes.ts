import { Router } from 'express';
import toolsController from '../controllers/tools.controller';

const router = Router({ mergeParams: true });

/**
 * @route GET /api/voice-agent/v1/job/:jobId/conversation/:conversationId/checklist
 * @desc Get checklist for application interview
 * @access Private (voice agent)
 */
router.get(
    '/checklist',
    toolsController.getChecklist
);

/**
 * @route POST /api/voice-agent/v1/job/:jobId/conversation/:conversationId/checklist
 * @desc Update checklist for application interview
 * @access Private (voice agent)
 */
router.post(
    '/checklist',
    toolsController.updateChecklist
);

/**
 * @route GET /api/voice-agent/v1/job/:jobId/conversation/:conversationId/script
 * @desc Get script for application interview
 * @access Private (voice agent)
 */
router.get(
    '/script',
    toolsController.getScript
);

export default router;
