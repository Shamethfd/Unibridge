import express from 'express';

import {
  getCurrentTutor,
  getTutorByStudentId,
  getLatestApplicationByStudentId,
} from '../controllers/tutorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: tutor profile by studentId
router.get('/by-student-id/:studentId', getTutorByStudentId);

// Authenticated: tutor profile for current logged-in user
router.get('/me', protect, getCurrentTutor);

// Public: tutor's latest application status by studentId
router.get('/application/latest/by-student-id/:studentId', getLatestApplicationByStudentId);

export default router;

