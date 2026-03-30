import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
import Module from './models/Module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Existing auth/resource/admin/notice APIs
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/management', resourceManagementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/notice-requests', noticeRequestRoutes);

// Newly merged module-request system APIs
app.use('/api/faculties', facultyRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'UniBridge API running' });
});

mongoose.connect(process.env.MONGODBURL)
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      await Module.syncIndexes();
    } catch (indexError) {
      console.error('Module index sync failed:', indexError.message);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
