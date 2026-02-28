import express from 'express';
import {
  adminLogin,
  createUser,
  getAllUsers,
  deleteUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { adminOnly, requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin login (public route with hardcoded credentials)
router.post('/login', adminLogin);

// Admin-only routes (protected)
router.post('/create-user', adminOnly, createUser);
router.get('/users', adminOnly, getAllUsers);
router.delete('/users/:id', adminOnly, deleteUser);

// Alternative: Use regular auth + admin check
// router.post('/create-user', protect, requireAdmin, createUser);
// router.get('/users', protect, requireAdmin, getAllUsers);
// router.delete('/users/:id', protect, requireAdmin, deleteUser);

export default router;
