import express from 'express';

import {
  createFeedback,
  getTutorFeedbackAndRating,
} from '../controllers/feedbackController.js';

const router = express.Router();

// Create new feedback
router.post('/', createFeedback);

// Tutor aggregates feedback + rating
router.get('/tutor/:tutorId', getTutorFeedbackAndRating);

export default router;