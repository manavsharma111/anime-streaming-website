const Redis = require("ioredis");
const dotenv = require("dotenv");
dotenv.config();

const redis = new Redis(process.env.REDIS_URI);

async function checkRedis() {
  try {
    console.log("Connecting to Redis...");
    const keys = await redis.keys('*');
    console.log(`Found ${keys.length} keys in Redis.`);
    
    // Group keys by prefix to give a summary
    const grouped = {};
    keys.forEach(key => {
      const prefix = key.split(':')[0]; // e.g. "bull" from "bull:videoProcessing:id"
      grouped[prefix] = (grouped[prefix] || 0) + 1;
    });

    console.log("\nSummary of Data in Redis:");
    for (const [prefix, count] of Object.entries(grouped)) {
      console.log(`- Prefix '${prefix}': ${count} keys`);
    }

    if (keys.length > 0) {
      console.log("\nSample Keys:");
      console.log(keys.slice(0, 10).join('\n'));
    }
  } catch (error) {
    console.error("Redis Error:", error.message);
  } finally {
    redis.quit();
  }
}

checkRedis();
