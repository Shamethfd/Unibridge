import express from 'express';

import {
  createApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
} from '../controllers/tutorApplicationController.js';

const router = express.Router();

// Tutor submits application
router.post('/', createApplication);

// Coordinator reviews applications
router.get('/', getAllApplications);

// Coordinator actions
router.patch('/:id/approve', approveApplication);
router.patch('/:id/reject', rejectApplication);

export default router;