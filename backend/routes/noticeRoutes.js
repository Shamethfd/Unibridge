import express from 'express';
import {
  createNotice, getNotices, getNoticeById,
  updateNotice, deleteNotice, archiveNotice,
  markViewed, getAnalytics,
} from '../controllers/noticeController.js';

const router = express.Router();

router.post('/', createNotice);
router.get('/', getNotices);
router.get('/analytics/stats', getAnalytics);
router.get('/:id', getNoticeById);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);
router.put('/:id/archive', archiveNotice);
router.put('/:id/view', markViewed);

export default router;