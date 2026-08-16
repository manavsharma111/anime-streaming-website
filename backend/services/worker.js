const { Worker } = require("bullmq")
const Redis = require("ioredis")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const { processAnimeVideo } = require("./ffmpegService")
const Episode = require("../models/Episode")
const connectDB = require("../config/db")
const fs = require("fs")

dotenv.config()
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

    let finalInputPath = inputPath
    let tempFilePath = null

    try {
      // Update status to processing
      await Episode.findByIdAndUpdate(episodeId, { status: "processing" })

      // Call the ffmpeg service
      // Assuming ffmpeg is installed system-wide, we pass null for ffmpegPath

      // If the inputPath is an R2 key, download it locally first to avoid FFmpeg HTTP streaming memory crash (SIGSEGV)
      if (inputPath && inputPath.startsWith("raw_videos/")) {
        const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
        if (publicUrl) {
          const r2Url = `${publicUrl}/${inputPath}`
          console.log(`[Worker] Downloading video locally from R2 to save memory: ${r2Url}`)
          
          const axios = require("axios")
          const path = require("path")
          
          // Create temp directory if it doesn't exist
          const tempDir = path.join(__dirname, "..", "uploads", "temp")
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
          }
          
          tempFilePath = path.join(tempDir, `temp_${Date.now()}.mp4`)
          
          const response = await axios({
            url: r2Url,
            method: 'GET',
            responseType: 'stream',
            timeout: 0, // No timeout for large video files
            maxRedirects: 5,
          })
          
          const writer = fs.createWriteStream(tempFilePath)
          response.data.pipe(writer)
          
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
          })
          
          finalInputPath = tempFilePath
          console.log(`[Worker] Download complete. Processing local file: ${finalInputPath}`)
        }
      }

      const result = await processAnimeVideo(
        null,
        finalInputPath,
        audioPaths || [],
        subtitlePaths || [],
        outputDir,
        job,
      )

      // upload to cloudflare r2
      const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
      if (publicUrl) {
        const { uploadDirectoryToR2 } = require("./r2UploadService")
        const path = require("path")
        const folderId = path.basename(outputDir)
        const s3Prefix = `uploads/processed/${folderId}`

        // Notify frontend that R2 upload is starting
        await job.updateProgress(99)
        if (global.io) {
          global.io.emit("video_progress", {
            episodeId: job.data.episodeId,
            percent: 99,
            eta: "Uploading to CDN...",
            taskName: "Uploading to CDN",
          })
        }

        const uploadSuccess = await uploadDirectoryToR2(outputDir, s3Prefix)

        if (uploadSuccess) {
          console.log(
            `[Worker] Upload to R2 successful. Deleting local files...`,
          )
          const fsPromises = require("fs/promises")
          await fsPromises.rm(outputDir, { recursive: true, force: true })

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

      // Notify frontend that DB is being updated
      await job.updateProgress(99.9)
      if (global.io) {
        global.io.emit("video_progress", {
          episodeId: job.data.episodeId,
          percent: 99.9,
          eta: "Saving to database...",
          taskName: "Saving to database",
        })
      }

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

      if (tempFilePath && fs.existsSync(tempFilePath)) {
        console.log(`[Worker] Deleting temporary downloaded file: ${tempFilePath}`)
        fs.unlinkSync(tempFilePath)
      }

      console.log(`[Worker] Database updated for episode ${episodeId}`)
      return result
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error)
      await Episode.findByIdAndUpdate(episodeId, { status: "failed" })
      
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        console.log(`[Worker] Deleting temporary downloaded file after error: ${tempFilePath}`)
        fs.unlinkSync(tempFilePath)
      }
      
      throw error
    }
  },
  {
    connection,
    lockDuration: 10800000, // 3 hours lock (prevents job from being re-queued while still processing)
    lockRenewTime: 60000,   // Renew lock every 60 seconds
  },
)

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully!`)
})

worker.on("failed", (job, err) => {
  console.log(`[Worker] Job ${job.id} failed with error: ${err.message}`)
})

console.log("[Worker] Waiting for video processing jobs...")

module.exports = worker
