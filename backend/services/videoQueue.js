const { Queue, Worker } = require("bullmq");
const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");
const { processAnimeVideo } = require("./ffmpegService");
const Episode = require("../models/Episode");

const connection = new Redis(process.env.REDIS_URI || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

const videoQueue = new Queue("anime-transcoding-queue", { connection });

const worker = new Worker(
  "anime-transcoding-queue",
  async (job) => {
    const { episodeId, inputPath, outputDir } = job.data;
    console.log(`🚀 [Queue Worker] Locked onto Job ${job.id} for Episode: ${episodeId}`);

    try {
      // 1. Mark status as processing in database
      await Episode.findByIdAndUpdate(episodeId, { status: "processing" });

      // 2. Fire structural encoding process
      const results = await processAnimeVideo(null, inputPath, [], [], outputDir);

      // 3. Update master URLs inside document matching model requirements
      await Episode.findByIdAndUpdate(episodeId, {
        status: "ready",
        hlsMasterUrl: results.hlsMaster,
        downloadQualities: results.downloads, // Key synchronized
      });

      // 4. File system cleaning logic to prevent low system space errors
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
        console.log(`🧹 Temp workspace file successfully destroyed: ${inputPath}`);
      }

      // Socket notification update channel logic hook if needed
      if (global.io) {
        global.io.emit("video-status-update", { episodeId, status: "ready" });
      }

      // Add Notification to all users
      const populatedEpisode = await Episode.findById(episodeId).populate('anime', 'title');
      if (populatedEpisode && populatedEpisode.anime) {
        const User = require('../models/User');
        const newNotification = {
          message: `New Episode: ${populatedEpisode.anime.title} - Episode ${populatedEpisode.episodeNumber}`,
          link: `/watch/${episodeId}`,
          read: false,
          createdAt: Date.now()
        };

        await User.updateMany({}, { $push: { notifications: newNotification } });

        if (global.io) {
          global.io.emit("new-notification", newNotification);
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error(`💥 Background worker thread failure for job ${job.id}:`, error);
      await Episode.findByIdAndUpdate(episodeId, {
        status: "failed",
        error: error.message,
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Processes 1 video at a time to stay completely safe from memory usage spikes
  }
);

worker.on("completed", async (job) => {
  console.log(`✅ Job ${job.id} removed from buffer. Storage limits clean.`);
  try {
    await job.remove(); // Reclaiming memory inside Redis cache layer
  } catch (err) {
    console.error(`Failed job flush: ${err.message}`);
  }
});

const addEpisodeToQueue = async (episodeId, inputPath, outputDir) => {
  await videoQueue.add("transcode-episode", { episodeId, inputPath, outputDir });
};

module.exports = { videoQueue, addEpisodeToQueue };