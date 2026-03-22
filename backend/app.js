import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

// Configure environment variables BEFORE importing routes that use them
dotenv.config({ path: envPath });

import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import resourceManagementRoutes from './routes/resourceManagementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import googleAuthRoutes from './routes/googleAuthSimple.js';
import Module from './models/Module.js';

// Debug: Check if .env file is being loaded
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('Looking for .env file at:', envPath);

// Try to read .env file directly to debug
import fs from 'fs';
try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 .env file content preview:');
    console.log(envContent.substring(0, 200) + '...');
  } else {
    console.log('❌ .env file does not exist at:', envPath);
  }
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}

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
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Missing');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/management', resourceManagementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/auth', googleAuthRoutes);

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
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      await Module.syncIndexes();
      console.log('✅ Module indexes synced successfully');
    } catch (indexError) {
      console.error('❌ Failed to sync module indexes:', indexError.message);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
