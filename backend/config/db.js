import mongoose from "mongoose";
import https from "https";

import dotenv from "dotenv";
dotenv.config();

const getEnv = (key, fallback) => {
  if (process.env[key] !== undefined) return process.env[key];
  const match = Object.keys(process.env).find((k) => k.trim() === key);
  return match ? process.env[match] : fallback;
};

const isSrvDnsError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  return msg.includes("querysrv") || msg.includes("enotfound") || msg.includes("dns");
};

const getHostsFromError = (err) => {
  const maps = [
    err?.reason?.servers,
    err?.cause?.servers,
    err?.cause?.reason?.servers,
  ];

  for (const mapValue of maps) {
    if (mapValue && typeof mapValue.keys === "function") {
      const hosts = Array.from(mapValue.keys()).filter(Boolean);
      if (hosts.length) return hosts;
    }
  }

  return [];
};

const getSetNameFromError = (err) => {
  return err?.reason?.setName || err?.cause?.setName || err?.cause?.reason?.setName || "";
};

const resolveDnsOverHttps = (name, type) => {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;

  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed?.Answer || []);
          } catch {
            resolve([]);
          }
        });
      })
      .on("error", () => resolve([]));
  });
};

const getHostsFromSrvDoh = async (srvUri) => {
  try {
    const parsed = new URL(srvUri);
    const srvName = `_mongodb._tcp.${parsed.hostname}`;
    const answers = await resolveDnsOverHttps(srvName, "SRV");

    return answers
      .map((a) => String(a?.data || "").trim())
      .map((record) => {
        const parts = record.split(/\s+/);
        if (parts.length < 4) return "";
        const port = parts[2];
        const host = parts[3].replace(/\.$/, "");
        return `${host}:${port}`;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const buildSeedListUriFromSrvFailure = async (srvUri, err) => {
  try {
    const parsed = new URL(srvUri);
    let hosts = getHostsFromError(err);
    if (!hosts.length) {
      hosts = await getHostsFromSrvDoh(srvUri);
    }
    if (!hosts.length) return null;

    const dbName = (parsed.pathname || "/").replace(/^\//, "");
    const query = new URLSearchParams(parsed.search || "");

    if (!query.has("ssl")) query.set("ssl", "true");
    if (!query.has("authSource")) query.set("authSource", "admin");
    const setName = getSetNameFromError(err);
    if (!query.has("replicaSet") && setName) {
      query.set("replicaSet", setName);
    }
    if (!query.has("retryWrites")) query.set("retryWrites", "true");
    if (!query.has("w")) query.set("w", "majority");

      const authPart = parsed.username
      ? `${encodeURIComponent(decodeURIComponent(parsed.username))}:${encodeURIComponent(decodeURIComponent(parsed.password || ""))}@`
      : "";

    const dbPart = dbName ? `/${dbName}` : "/";
    return `mongodb://${authPart}${hosts.join(",")}${dbPart}?${query.toString()}`;
  } catch {
    return null;
  }
};

export default async function connectDB() {
  const envMongoUri = (getEnv("MONGODBURL", getEnv("MONGODB_URI", "")) || "").trim();
  const localMongoUri = "mongodb://127.0.0.1:27017/unibridge";

  // Try configured URI first (usually Atlas), then fall back to local MongoDB.
  const candidates = [envMongoUri, localMongoUri].filter(Boolean);

  let lastError;
  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
      });
      console.log(`MongoDB connected (${uri === localMongoUri ? "local" : "configured URI"})`);
      return;
    } catch (err) {
      if (uri.startsWith("mongodb+srv://") && isSrvDnsError(err)) {
        const seedListUri = await buildSeedListUriFromSrvFailure(uri, err);
        if (seedListUri) {
          try {
            await mongoose.connect(seedListUri, {
              serverSelectionTimeoutMS: 10000,
              family: 4,
            });
            console.log("MongoDB connected (Atlas fallback without SRV lookup)");
            return;
          } catch (fallbackErr) {
            lastError = fallbackErr;
            console.warn("MongoDB Atlas fallback connection failed");
            console.warn(`Reason: ${fallbackErr.message}`);
          }
        }
      }

      lastError = err;
      console.warn(`MongoDB connection failed for URI: ${uri}`);
      console.warn(`Reason: ${err.message}`);
    }
  }

  throw lastError;
}
