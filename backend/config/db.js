import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

const getEnv = (key, fallback) => {
  if (process.env[key] !== undefined) return process.env[key];
  const match = Object.keys(process.env).find((k) => k.trim() === key);
  return match ? process.env[match] : fallback;
};

export default async function connectDB() {
  const mongoUri = getEnv("MONGODBURL", "mongodb://127.0.0.1:27017/unibridge");
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}