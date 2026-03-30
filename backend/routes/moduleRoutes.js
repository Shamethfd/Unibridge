import express from 'express';
import {
  createModule,
  getModulesByYearSemester,
  getModulesBySemester,
  updateModule,
  deleteModule,
  getModuleById
} from '../controllers/moduleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getModulesByYearSemester);
router.get('/id/:id', getModuleById);
router.get('/:semesterId', getModulesBySemester);

// Protected routes (only authentication required)
router.post('/', protect, createModule);
router.put('/:id', protect, updateModule);
router.delete('/:id', protect, deleteModule);

export default router;
