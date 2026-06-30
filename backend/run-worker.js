const dotenv = require("dotenv");
dotenv.config();

console.log("=========================================");
console.log("   DISTRIBUTED ENCODING WORKER NODE      ");
console.log("=========================================");

// Ensure FFmpeg is accessible. Our worker.js requires the ffmpegService which relies on system ffmpeg or local binaries.
console.log(`Connecting to Redis: ${process.env.REDIS_URI}`);

// Require the worker which automatically connects to Redis and starts listening for jobs
require("./services/worker");

console.log("Worker is running and waiting for jobs from the queue...");
console.log("To scale your infrastructure, simply copy this backend code to another VPS");
console.log("and run `node run-worker.js`. It will instantly join the encoding cluster!");
