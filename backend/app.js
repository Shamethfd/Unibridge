import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';

import tutorApplicationRoutes from './routes/tutorApplicationRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import tutorNotificationRoutes from './routes/tutorNotificationRoutes.js';

dotenv.config({ path: './.env' });

const app = express();

const allowedOriginFromEnv = process.env.CORS_ORIGIN;

// CORS is required for the React frontend running on a different origin.
app.use(
  cors({
    // Allow configured origin and any localhost frontend port in development.
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header), e.g. Postman/curl.
      if (!origin) return callback(null, true);

      if (allowedOriginFromEnv && origin === allowedOriginFromEnv) {
        return callback(null, true);
      }

      // React dev server may auto-switch ports (3000, 3001, ...).
      if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API routes (used by the frontend workflow pages).
app.use('/api/tutor-applications', tutorApplicationRoutes);
app.use('/api/sessions', studySessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tutor-notifications', tutorNotificationRoutes);

app.get('/', (req, res) => res.send('UniBridge backend running'));

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
