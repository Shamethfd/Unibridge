import mongoose from "mongoose";
import dns from "dns";

import dotenv from "dotenv";
dotenv.config();

const getEnv = (key, fallback) => {
  if (process.env[key] !== undefined) return process.env[key];
  const match = Object.keys(process.env).find((k) => k.trim() === key);
  return match ? process.env[match] : fallback;
};

export default async function connectDB() {
  const envMongoUri = getEnv("MONGODBURL", "");
  const localMongoUri = "mongodb://127.0.0.1:27017/unibridge";

  // Keep using the .env URI, but use public DNS resolvers to avoid
  // local DNS setups that reject Atlas SRV lookups.
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  // Try configured URI first (usually Atlas), then fall back to local MongoDB.
  const candidates = [envMongoUri, localMongoUri].filter(Boolean);

  let lastError;
  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`MongoDB connected (${uri === localMongoUri ? "local" : "configured URI"})`);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`MongoDB connection failed for URI: ${uri}`);
      console.warn(`Reason: ${err.message}`);
    }
  }

  throw lastError;
}
