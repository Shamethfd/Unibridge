import express from 'express';

import { getByStudentId, markRead, markAllRead } from '../controllers/tutorNotificationController.js';

const router = express.Router();

// Specific paths first (avoid :id vs studentId confusion)
router.patch('/student/:studentId/read-all', markAllRead);
router.get('/student/:studentId', getByStudentId);
router.patch('/:id/read', markRead);

export default router;
