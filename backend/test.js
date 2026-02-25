import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

console.log('Testing MongoDB connection...');
console.log('MongoDB URL:', process.env.MONGODBURL);

mongoose.connect(process.env.MONGODBURL)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });
