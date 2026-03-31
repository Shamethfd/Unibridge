import express from 'express';

import {
  createSession,
  getAllSessions,
  getSessionsByTutorStudentId,
} from '../controllers/studySessionController.js';

const router = express.Router();

// Tutor creates a session
router.post('/', createSession);

// Public: list all sessions
router.get('/', getAllSessions);

// Tutor convenience: list sessions for a given tutor studentId
router.get('/tutor/:studentId', getSessionsByTutorStudentId);

export default router;