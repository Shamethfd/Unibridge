import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';

dotenv.config({ path: './.env' });

// Temporary fix: Hardcode JWT_SECRET if not loaded from .env
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'learnbridge_super_secret_key_123456789';
  console.log('⚠️  JWT_SECRET was missing, using temporary hardcoded value');
}

// Debug: Check environment variables
console.log('Environment Variables Check:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('MONGODBURL:', process.env.MONGODBURL ? '✅ Set' : '❌ Missing');
console.log('PORT:', process.env.PORT || '❌ Missing');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || '❌ Missing');

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: `${process.env.CORS_ORIGIN}`,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    env: {
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
      MONGODBURL: process.env.MONGODBURL ? 'Set' : 'Missing'
    }
  });
});

mongoose.connect(`${process.env.MONGODBURL}`)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
