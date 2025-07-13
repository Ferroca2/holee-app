import { Router } from 'express';
import toolsRoutes from './tools.routes';

const router = Router({ mergeParams: true });

// Voice Agent tools routes
router.use('/v1/job/:jobId/conversation/:conversationId', toolsRoutes);

export default router;
