const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")

// Load env vars
dotenv.config()

// Connect to database (serverless-safe caching is handled inside db.js)
connectDB().catch(err => console.error("DB Connection Failed on startup:", err))

// ─── Detect Vercel serverless environment ─────────────────────────────────────
const isVercel = !!process.env.VERCEL

// ─── Background Worker (only in non-serverless) ───────────────────────────────
if (!isVercel) {
  try {
    require("./services/worker")
  } catch (err) {
    console.warn("[Server] Worker could not be started:", err.message)
  }
}

const app = express()

// ─── Socket.io (only in non-serverless) ──────────────────────────────────────
if (!isVercel) {
  const http = require("http")
  const { Server } = require("socket.io")
  const server = http.createServer(app)

  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4000",
        process.env.CLIENT_URL,
      ].filter(Boolean),
      credentials: true,
    },
  })

  global.io = io

  const PORT = process.env.PORT || 4000
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
  })
}

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4000",
        process.env.CLIENT_URL,
      ].filter(Boolean)

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Serve uploads statically (only useful locally; on Vercel use R2)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ─── Routes ───────────────────────────────────────────────────────────────────
const videoRoutes = require("./routes/videoRoutes")
const authRoutes = require("./routes/authRoutes")
const historyRoutes = require("./routes/historyRoutes")
const wishlistRoutes = require("./routes/wishListRoutes")
const animeRoutes = require("./routes/animeRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const animeAdminRoutes = require("./routes/animeAdminRoutes")
const reviewRoutes = require("./routes/reviewRoutes")

app.use("/api/videos", videoRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/history", historyRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/anime", animeRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/anime-admin", animeAdminRoutes)
app.use("/api/reviews", reviewRoutes)

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Anime Streaming Backend is running ✅" })
})

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  })
})

// ─── Export for Vercel Serverless ─────────────────────────────────────────────
module.exports = app
