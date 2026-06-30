require("dotenv").config();
const Redis = require("ioredis");

async function run() {
  const uri = process.env.REDIS_URI || "redis://127.0.0.1:6379";
  console.log("Connecting to:", uri);
  
  const redis = new Redis(uri);
  
  try {
    await redis.flushall();
    console.log("Redis cache flushed successfully!");
  } catch(e) {
    console.error("Failed to flush redis:", e.message);
  } finally {
    process.exit(0);
  }
}
run();
