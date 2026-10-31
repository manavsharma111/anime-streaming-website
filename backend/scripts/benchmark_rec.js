const dotenv = require("dotenv")
const mongoose = require("mongoose")
const Redis = require("ioredis")
const { performance } = require("perf_hooks")

const path = require("path")
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const MONGODB_URI = process.env.MONGODB_URI
const REDIS_URI = process.env.REDIS_URI || "redis://127.0.0.1:6379"

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in backend/.env")
  process.exit(1)
}

const redis = new Redis(REDIS_URI, { maxRetriesPerRequest: null })
redis.on("error", (err) => {
  console.warn("⚠️ Redis connection warning:", err.message)
})

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
}

function stdDev(arr, mean) {
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length
  return Math.sqrt(variance)
}

async function runBenchmark() {
  console.log("======================================================")
  console.log("🔬 Rigorous Recommendation Latency Benchmark (N = 30)")
  console.log("======================================================\n")

  try {
    console.log("⏳ Connecting to MongoDB Atlas & Redis...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Database connections established.\n")

    const Anime = require("../models/Anime")
    const History = require("../models/History")
    const Wishlist = require("../models/Wishlist")
    const User = require("../models/User")

    let testUser = await User.findOne()
    let userId = testUser ? testUser._id : new mongoose.Types.ObjectId()

    const iterations = 30
    const coldTimes = []
    const hotTimes = []
    const testRedisKey = `benchmark_rec:${userId}`

    console.log(`🚀 Executing ${iterations} consecutive iterations...\n`)

    for (let i = 1; i <= iterations; i++) {
      await redis.del(testRedisKey)

      // Cold DB Run
      const coldStart = performance.now()
      const [history, wishlist] = await Promise.all([
        History.find({ user: userId }).populate("anime").sort({ updatedAt: -1 }).lean(),
        Wishlist.find({ user: userId, status: { $in: ["Completed", "Watching", "Planning"] } }).populate("anime").lean(),
      ])

      const excludedIds = [
        ...history.map((h) => h.anime?._id),
        ...wishlist.map((w) => w.anime?._id),
      ].filter(Boolean)

      const candidates = await Anime.find({ _id: { $nin: excludedIds } })
        .sort({ rating: -1, views: -1 })
        .limit(12)
        .lean()

      await redis.setex(testRedisKey, 1800, JSON.stringify(candidates))
      const coldEnd = performance.now()
      coldTimes.push(parseFloat((coldEnd - coldStart).toFixed(2)))

      // Hot Redis Run
      const hotStart = performance.now()
      const cachedData = await redis.get(testRedisKey)
      const parsed = JSON.parse(cachedData)
      const hotEnd = performance.now()
      hotTimes.push(parseFloat((hotEnd - hotStart).toFixed(2)))
    }

    await redis.del(testRedisKey)

    const avgCold = coldTimes.reduce((a, b) => a + b, 0) / iterations
    const avgHot = hotTimes.reduce((a, b) => a + b, 0) / iterations
    const medianCold = percentile(coldTimes, 50)
    const medianHot = percentile(hotTimes, 50)
    const p95Cold = percentile(coldTimes, 95)
    const p95Hot = percentile(hotTimes, 95)
    const p99Cold = percentile(coldTimes, 99)
    const p99Hot = percentile(hotTimes, 99)
    const sdCold = stdDev(coldTimes, avgCold)
    const sdHot = stdDev(hotTimes, avgHot)

    console.log("======================================================")
    console.log("📊 STATISTICAL BENCHMARK RESULTS (N = 30)")
    console.log("======================================================")
    console.log(`Metric\t\tMongoDB Atlas\t\tRedis In-Memory`)
    console.log(`Average\t\t${avgCold.toFixed(2)} ms\t\t${avgHot.toFixed(2)} ms`)
    console.log(`Median (P50)\t${medianCold.toFixed(2)} ms\t\t${medianHot.toFixed(2)} ms`)
    console.log(`P95\t\t${p95Cold.toFixed(2)} ms\t\t${p95Hot.toFixed(2)} ms`)
    console.log(`P99\t\t${p99Cold.toFixed(2)} ms\t\t${p99Hot.toFixed(2)} ms`)
    console.log(`Std Deviation\t${sdCold.toFixed(2)} ms\t\t${sdHot.toFixed(2)} ms`)
    console.log("======================================================")
    const speedup = (avgCold / avgHot).toFixed(2)
    const reduction = (((avgCold - avgHot) / avgCold) * 100).toFixed(1)
    console.log(`⚡ Speedup Multiplier: ${speedup}x`)
    console.log(`📉 Latency Reduction: ${reduction}%`)
  } catch (err) {
    console.error("❌ Benchmark failed:", err.message)
  } finally {
    await mongoose.disconnect()
    await redis.quit()
    process.exit(0)
  }
}

runBenchmark()
