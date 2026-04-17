import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { protect as authMiddleware } from '../middleware/authMiddleware.js';
import * as chatController from '../controllers/chatController.js';
import * as chatMessageController from '../controllers/chatMessageController.js';

const uploadsDir = path.resolve('uploads/chat');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginal}`);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedMimeTypes = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/bmp',
		'image/svg+xml',
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'text/plain',
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
		return;
	}

	cb(new Error('Only image and document files are allowed'));
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Conversation routes
router.get('/tutors', chatController.getAvailableTutors);
router.post('/conversations', chatController.startOrGetConversation);
router.get('/conversations', chatController.getUserConversations);
router.get('/conversations/:conversationId/messages', chatController.getConversationMessages);
router.put('/conversations/:conversationId/read', chatController.markMessagesAsRead);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

// Message routes
router.post('/messages', upload.array('attachments', 5), chatMessageController.sendMessage);
router.get('/conversations/:conversationId/unread', chatMessageController.getUnreadCount);
router.get('/messages/unread/total', chatMessageController.getTotalUnreadCount);
router.delete('/messages/:messageId', chatMessageController.deleteMessage);

export default router;
