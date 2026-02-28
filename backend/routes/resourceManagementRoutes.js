import express from 'express';
import {
  submitResource,
  getPendingResources,
  approveResource,
  rejectResource,
  getApprovedResources,
  updateResource,
  deleteResource,
  getResourceStats
} from '../controllers/resourceManagementController.js';
import { protect, authorize, authorizeResourceManager } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student routes
router.post('/submit', protect, authorize('student'), submitResource);

// Resource Manager routes
router.get('/pending', protect, authorizeResourceManager, getPendingResources);
router.put('/:id/approve', protect, authorizeResourceManager, approveResource);
router.put('/:id/reject', protect, authorizeResourceManager, rejectResource);
router.get('/stats', protect, authorizeResourceManager, getResourceStats);

// Public routes (approved resources)
router.get('/approved', getApprovedResources);

// Resource Manager only routes (update/delete)
router.put('/:id', protect, authorizeResourceManager, updateResource);
router.delete('/:id', protect, authorizeResourceManager, deleteResource);

export default router;
