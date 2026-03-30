import express from 'express';
import {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  deleteRequest,
} from '../controllers/noticeRequestController.js';

const router = express.Router();

router.post('/', createRequest);
router.get('/', getRequests);
router.put('/:id/approve', approveRequest);
router.put('/:id/reject', rejectRequest);
router.delete('/:id', deleteRequest);

export default router;