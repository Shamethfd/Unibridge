import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import noticeRoutes from './routes/noticeRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notices', noticeRoutes);

mongoose.connect(process.env.MONGODBURL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));