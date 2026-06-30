const Episode = require("../models/Episode")
const { Queue } = require("bullmq")
const path = require("path")
const Redis = require("ioredis")

// Setup BullMQ Queue
// Ensure you have Redis running!
const connection = new Redis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  },
)
connection.on("error", (err) => console.log("Redis queue error:", err.message))
const videoQueue = new Queue("videoProcessing", { connection })

const uploadEpisode = async (req, res, next) => {
  try {
    const { anime, episodeNumber, title, scheduledAt } = req.body

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a video file" })
    }
    let calculatedDelay = 0
    let initialStatus = "queued"
    if (scheduledAt) {
      const targetTime = new Date(scheduledAt).getTime()
      const currentTime = Date.now()
      calculatedDelay = Math.max(0, targetTime - currentTime)
      if (targetTime > currentTime) initialStatus = "scheduled"
    }
    //Create the episode in the database with "queued" status
    const newEpisode = new Episode({
      anime,
      episodeNumber,
      title,
      duration: 0,
      introStart: Number(req.body.introStart || 0),
      introEnd: Number(req.body.introEnd || 0),
      outroStart: Number(req.body.outroStart || 0),
      outroEnd: Number(req.body.outroEnd || 0),
      status: initialStatus,
    })

    await newEpisode.save()

    // The path to the raw uploaded video
    const rawVideoPath = req.file.path

    // Output directory where FFmpeg will save HLS and MP4s for this episode
    // e.g. uploads/processed/episode_id/
    const outputDir = path.join(
      __dirname,
      "..",
      "uploads",
      "processed",
      newEpisode._id.toString(),
    )

    // 2. Add job to BullMQ
    await videoQueue.add(
      "processVideo",
      {
        episodeId: newEpisode._id,
        inputPath: rawVideoPath,
        outputDir: outputDir,
      },
      {
        delay: calculatedDelay,
      },
    )

    res.status(202).json({
      success: true,
      message: "Video uploaded successfully. Processing started in background.",
      data: {
        episodeId: newEpisode._id,
        status: newEpisode.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  uploadEpisode,
  videoQueue,
}
