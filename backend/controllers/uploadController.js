const Episode = require("../models/Episode")
const { Queue } = require("bullmq")
const path = require("path")
const Redis = require("ioredis")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
})

// Setup BullMQ Queue
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
    const outputDir = path.join(
      __dirname,
      "..",
      "uploads",
      "processed",
      newEpisode._id.toString(),
    )

    // Add job to BullMQ
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

const getPresignedUrl = async (req, res, next) => {
  try {
    const { filename, contentType } = req.body
    if (!filename || !contentType) {
      return res
        .status(400)
        .json({ message: "Filename and content type required" })
    }

    // Sanitize and generate unique key
    const sanitizedOriginalName = filename.replace(/[^a-zA-Z0-9.]/g, "_")
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const key = `raw_videos/anime-${uniqueSuffix}-${sanitizedOriginalName}`

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    // URL expires in 24 hours
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 86400,
    })

    res.status(200).json({
      success: true,
      data: {
        presignedUrl,
        key,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  uploadEpisode,
  getPresignedUrl,
  videoQueue,
}
