import express from 'express';
import {
  createModule,
  getModulesByYearSemester,
  updateModule,
  deleteModule,
  getModuleById
} from '../controllers/moduleController.js';
import { protect, authorizeResourceManager } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getModulesByYearSemester);
router.get('/:id', getModuleById);

// Resource Manager only routes (protected)
router.post('/', protect, authorizeResourceManager, createModule);
router.put('/:id', protect, authorizeResourceManager, updateModule);
router.delete('/:id', protect, authorizeResourceManager, deleteModule);

export default router;
