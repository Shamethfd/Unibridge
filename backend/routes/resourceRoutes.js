import express from 'express';
import {
  uploadResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource,
  getMyResources
} from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getResources);
router.get('/:id', getResourceById);
router.get('/:id/download', downloadResource);

// Protected routes
router.post('/upload', protect, uploadResource);
router.get('/my-resources', protect, getMyResources);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

export default router;
