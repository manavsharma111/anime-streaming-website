const mongoose = require("mongoose")
const dotenv = require("dotenv")
const fs = require("fs/promises")
const path = require("path")
const { Queue } = require("bullmq")
const Redis = require("ioredis")

const Anime = require("../models/Anime")
const Episode = require("../models/Episode")

dotenv.config()

const connection = new Redis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
  { maxRetriesPerRequest: null },
)
const videoQueue = new Queue("videoProcessing", { connection })

const BULK_DIR = path.join(__dirname, "bulk_drops")

const runBulkUpload = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB for Bulk Upload...")

    // Create bulk_drops folder if it doesn't exist
    try {
      await fs.access(BULK_DIR)
    } catch {
      await fs.mkdir(BULK_DIR)
      console.log(
        "Created bulk_drops directory. Please place your files there.",
      )
      process.exit(0)
    }

    const files = await fs.readdir(BULK_DIR)
    const videoFiles = files.filter(
      (f) => f.endsWith(".mp4") || f.endsWith(".mkv"),
    )

    if (videoFiles.length === 0) {
      console.log(
        "No video files found in bulk_drops/. Please add files and run again.",
      )
      process.exit(0)
    }

    console.log(`Found ${videoFiles.length} videos to process.`)

    for (const file of videoFiles) {
      // Expected Format: AnimeName_E(Number)_Title.mkv
      // Example: Naruto_E15_The Final Battle.mkv
      const regex = /^(.+?)_E(\d+?)_(.+)\.(mp4|mkv)$/i
      const match = file.match(regex)

      if (!match) {
        console.error(
          `Skipping ${file} - Invalid naming format. Use: AnimeName_E(Number)_Title.mkv`,
        )
        continue
      }

      const animeName = match[1].trim()
      const episodeNumber = parseInt(match[2], 10)
      const title = match[3].trim()

      // Find the Anime in DB (Case insensitive)
      let animeDoc = await Anime.findOne({
        title: { $regex: new RegExp(`^${animeName}$`, "i") },
      })

      if (!animeDoc) {
        console.error(
          `Skipping ${file} - Anime "${animeName}" not found in Database. Please create the Anime first.`,
        )
        continue
      }

      // Check for optional JSON Sidecar for Skip Timings (e.g. Naruto_E15_The Final Battle.json)
      let introStart = 0,
        introEnd = 0,
        outroStart = 0,
        outroEnd = 0
      const jsonSidecarPath = path.join(
        BULK_DIR,
        file.replace(/\.(mp4|mkv)$/i, ".json"),
      )
      try {
        await fs.access(jsonSidecarPath)
        const jsonContent = await fs.readFile(jsonSidecarPath, "utf-8")
        const meta = JSON.parse(jsonContent)
        introStart = meta.introStart || 0
        introEnd = meta.introEnd || 0
        outroStart = meta.outroStart || 0
        outroEnd = meta.outroEnd || 0
        console.log(
          `Loaded skip timings from sidecar JSON for Ep ${episodeNumber}`,
        )
      } catch (err) {
        // No JSON file or invalid JSON, ignore and use defaults
      }

      // Create Episode in DB
      const newEpisode = new Episode({
        anime: animeDoc._id,
        episodeNumber,
        title,
        introStart,
        introEnd,
        outroStart,
        outroEnd,
        status: "queued",
      })

      await newEpisode.save()

      // Dispatch to BullMQ
      const rawVideoPath = path.join(BULK_DIR, file)
      const outputDir = path.join(
        __dirname,
        "uploads",
        "processed",
        newEpisode._id.toString(),
      )

      await videoQueue.add("processVideo", {
        episodeId: newEpisode._id,
        inputPath: rawVideoPath,
        outputDir: outputDir,
      })

      console.log(
        `✅ Queued: ${animeDoc.title} - Episode ${episodeNumber} (${title})`,
      )
    }

    console.log("Bulk upload dispatch complete. Workers will now process them.")
    process.exit(0)
  } catch (err) {
    console.error("Bulk Upload Error:", err)
    process.exit(1)
  }
}

runBulkUpload()
