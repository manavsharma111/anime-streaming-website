/**
 * ONE-TIME FIX SCRIPT
 * 
 * Regenerates corrupt master.m3u8 files in R2 for all episodes
 * that were uploaded before the regex bug was fixed.
 * 
 * Run with: node fix_master_m3u8.js
 */

const dotenv = require("dotenv")
dotenv.config()

const mongoose = require("mongoose")
const axios = require("axios")
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL

// The correct master.m3u8 content that should always be uploaded
const CORRECT_MASTER_PLAYLIST = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080
0/manifest.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720
1/manifest.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480
2/manifest.m3u8
`

async function streamToString(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString("utf8")
}

async function fixEpisode(episode) {
  try {
    const masterUrl = episode.hlsMasterUrl
    if (!masterUrl || !masterUrl.startsWith("http")) {
      console.log(`  ⏭️  Skipping - not an R2 URL: ${masterUrl}`)
      return false
    }

    // Download current master.m3u8 from R2
    let currentContent = ""
    try {
      const resp = await axios.get(masterUrl, { timeout: 10000 })
      currentContent = resp.data
    } catch (e) {
      console.log(`  ⚠️  Could not fetch master.m3u8: ${e.message}`)
      currentContent = ""
    }

    // Check if it's already valid (has stream entries)
    const hasStreams = currentContent.includes("0/manifest.m3u8") || 
                       currentContent.includes("1/manifest.m3u8")
    
    if (hasStreams) {
      console.log(`  ✅ Already valid — skipping`)
      return false
    }

    console.log(`  🔧 Corrupt/empty master.m3u8 detected. Fixing...`)
    console.log(`     Current content: ${currentContent.substring(0, 100).replace(/\n/g, "\\n")}`)

    // Extract the R2 key from the URL
    // e.g. https://pub.r2.dev/uploads/processed/EPISODE_ID/streaming/master.m3u8
    const urlObj = new URL(masterUrl)
    const s3Key = urlObj.pathname.replace(/^\//, "") // remove leading slash

    console.log(`     Uploading fix to key: ${s3Key}`)

    // Upload the correct master.m3u8
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: Buffer.from(CORRECT_MASTER_PLAYLIST, "utf8"),
      ContentType: "application/vnd.apple.mpegurl",
    }))

    console.log(`  ✅ Fixed!`)
    return true
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`)
    return false
  }
}

async function main() {
  console.log("🔧 master.m3u8 Fix Script Starting...\n")
  
  await mongoose.connect(process.env.MONGODB_URI)
  console.log("✅ Connected to MongoDB\n")

  const Episode = require("./models/Episode")

  // Find all episodes that are "ready" and have an R2 hlsMasterUrl
  const episodes = await Episode.find({ 
    status: "ready",
    hlsMasterUrl: { $regex: /^http/, $exists: true, $ne: "" }
  }).populate("anime", "title")

  console.log(`Found ${episodes.length} episodes to check.\n`)

  let fixed = 0
  let skipped = 0

  for (const ep of episodes) {
    const animeName = ep.anime?.title || "Unknown Anime"
    console.log(`🎬 [Ep ${ep.episodeNumber}] ${animeName} - ${ep._id}`)
    
    const wasFixed = await fixEpisode(ep)
    if (wasFixed) fixed++
    else skipped++
  }

  console.log(`\n✅ Done! Fixed: ${fixed} | Already OK / Skipped: ${skipped}`)
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
