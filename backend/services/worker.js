const { Worker } = require("bullmq")
const Redis = require("ioredis")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const { processAnimeVideo } = require("./ffmpegService")
const Episode = require("../models/Episode")
const connectDB = require("../config/db")

dotenv.config()

// Connect to database if not already connected
connectDB()

const connection = new Redis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  },
)
connection.on("error", (err) => console.log("Redis worker error:", err.message))

const worker = new Worker(
  "videoProcessing",
  async (job) => {
    const { episodeId, inputPath, audioPaths, subtitlePaths, outputDir } =
      job.data
    console.log(
      `[Worker] Started processing job ${job.id} for episode ${episodeId}`,
    )

    try {
      // Update status to processing
      await Episode.findByIdAndUpdate(episodeId, { status: "processing" })

      // Call the ffmpeg service
      // Assuming ffmpeg is installed system-wide, we pass null for ffmpegPath
      const result = await processAnimeVideo(
        null,
        inputPath,
        audioPaths || [],
        subtitlePaths || [],
        outputDir,
        job,
      )

      // Upload to Cloudflare R2
      const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
      if (publicUrl) {
        const { uploadDirectoryToR2 } = require("./r2UploadService")
        // We need to construct the S3 prefix from the outputDir, e.g., 'uploads/processed/folderId'
        // outputDir is like c:\NEWTUBE\backend\public\uploads\processed\6a42...
        const path = require("path")
        const folderId = path.basename(outputDir)
        const s3Prefix = `uploads/processed/${folderId}`

        const uploadSuccess = await uploadDirectoryToR2(outputDir, s3Prefix)

        if (uploadSuccess) {
          console.log(
            `[Worker] Upload to R2 successful. Deleting local files...`,
          )
          const fs = require("fs/promises")
          await fs.rm(outputDir, { recursive: true, force: true })

          // Rewrite local URLs to R2 Public URLs
          const rewriteUrl = (url) => (url ? `${publicUrl}${url}` : url)

          result.hlsMaster = rewriteUrl(result.hlsMaster)

          if (result.downloads) {
            for (const key in result.downloads) {
              result.downloads[key] = rewriteUrl(result.downloads[key])
            }
          }

          if (result.embeddedSubtitles) {
            result.embeddedSubtitles = result.embeddedSubtitles.map((sub) => ({
              ...sub,
              url: rewriteUrl(sub.url),
            }))
          }
        } else {
          console.error(`[Worker] R2 upload failed. Keeping local files.`)
        }
      }

      console.log(
        `[Worker] Job ${job.id} finished processing. Updating database...`,
      )

      // Update database with the URLs returned (now potentially R2 URLs)
      const updateData = {
        status: "ready",
        hlsMasterUrl: result.hlsMaster,
        downloadQualities: result.downloads,
      }

      if (result.embeddedSubtitles && result.embeddedSubtitles.length > 0) {
        // Use $push to append them to the existing subtitleTracks
        await Episode.findByIdAndUpdate(episodeId, {
          $set: updateData,
          $push: { subtitleTracks: { $each: result.embeddedSubtitles } },
        })
      } else {
        await Episode.findByIdAndUpdate(episodeId, updateData)
      }

      console.log(`[Worker] Database updated for episode ${episodeId}`)
      return result
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error)
      await Episode.findByIdAndUpdate(episodeId, { status: "failed" })
      throw error
    }
  },
  { connection },
)

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully!`)
})

worker.on("failed", (job, err) => {
  console.log(`[Worker] Job ${job.id} failed with error: ${err.message}`)
})

console.log("[Worker] Waiting for video processing jobs...")

module.exports = worker
