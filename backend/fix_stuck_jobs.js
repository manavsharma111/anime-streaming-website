require("dotenv").config();
const { Queue } = require("bullmq");
const Redis = require("ioredis");
const mongoose = require("mongoose");
const Episode = require("./models/Episode");

async function fixStuckJobs() {
  console.log("Connecting to Redis and MongoDB...");
  const connection = new Redis(process.env.REDIS_URI);
  await mongoose.connect(process.env.MONGODB_URI);

  const queue = new Queue("videoProcessing", { connection });
  
  console.log("Clearing active and delayed jobs from BullMQ...");
  await queue.obliterate({ force: true });
  console.log("Queue obliterated!");

  console.log("Resetting stuck episodes in DB...");
  const result = await Episode.updateMany({ status: "processing" }, { $set: { status: "failed", error: "Job cleared due to being stuck" } });
  console.log(`Updated ${result.modifiedCount} stuck episodes to failed status.`);

  process.exit(0);
}

fixStuckJobs().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
