import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import Module from './models/Module.js';

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import resourceManagementRoutes from './routes/resourceManagementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import googleAuthRoutes from './routes/googleAuthSimple.js';
import noticeRoutes from './routes/noticeRoutes.js';
import noticeRequestRoutes from './routes/noticeRequestRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import yearRoutes from './routes/yearRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

import tutorApplicationRoutes from './routes/tutorApplicationRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import tutorNotificationRoutes from './routes/tutorNotificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const allowedOriginFromEnv = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOriginFromEnv && origin === allowedOriginFromEnv) {
        return callback(null, true);
      }

      if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/management', resourceManagementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/notice-requests', noticeRequestRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/messages', messageRoutes);

app.use('/api/tutor-applications', tutorApplicationRoutes);
app.use('/api/sessions', studySessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tutor-notifications', tutorNotificationRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'UniBridge API running' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  try {
    await Module.syncIndexes();
  } catch (indexError) {
    console.error('Module index sync failed:', indexError.message);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
