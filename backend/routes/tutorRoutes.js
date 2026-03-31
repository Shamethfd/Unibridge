import express from 'express';

import {
  getTutorByStudentId,
  getLatestApplicationByStudentId,
} from '../controllers/tutorController.js';

const router = express.Router();

// Public: tutor profile by studentId
router.get('/by-student-id/:studentId', getTutorByStudentId);

// Public: tutor's latest application status by studentId
router.get('/application/latest/by-student-id/:studentId', getLatestApplicationByStudentId);

export default router;

