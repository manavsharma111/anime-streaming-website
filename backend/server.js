const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")

// Load env vars
dotenv.config()

// Connect to database
connectDB().catch((err) =>
  console.error("DB Connection Failed on startup:", err),
)

// Start the background worker for video processing
try {
  require("./services/worker")
} catch (err) {
  console.warn("[Server] Worker could not be started:", err.message)
}

const app = express()

// Initialize WebSocket server
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
      "https://anime-streaming-website-seven.vercel.app",
    ].filter(Boolean),
    credentials: true,
  },
})

global.io = io

const PORT = process.env.PORT || 4000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})

// Setup global middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4000",
        process.env.CLIENT_URL,
        "https://anime-streaming-website-seven.vercel.app",
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

// Serve uploads 
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Register API routes
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

// Basic health check endpoint
app.get("/", (req, res) => {
  res.send("<h1>Anime Streaming Backend is running ✅</h1>")
})

// Temporary route to fix m3u8 files from the browser
app.get("/api/fix-m3u8", (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const processedDir = path.join(__dirname, 'uploads/processed');
  
  if (!fs.existsSync(processedDir)) {
    return res.send("Processed directory not found.");
  }
  
  const episodes = fs.readdirSync(processedDir);
  let fixedCount = 0;
  
  for (const episode of episodes) {
    const masterPath = path.join(processedDir, episode, 'streaming', 'master.m3u8');
    if (fs.existsSync(masterPath)) {
      let content = fs.readFileSync(masterPath, 'utf8');
      let originalContent = content;
  
      content = content.replace(/\\/g, '/');
      const lines = content.split('\n');
      let hasDefaultAudio = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('#EXT-X-MEDIA:TYPE=AUDIO')) {
          if (!hasDefaultAudio && lines[i].includes('DEFAULT=YES')) {
            hasDefaultAudio = true;
          } else if (hasDefaultAudio && lines[i].includes('DEFAULT=YES')) {
            lines[i] = lines[i].replace('DEFAULT=YES', 'DEFAULT=NO');
          } else if (!hasDefaultAudio && lines[i].includes('DEFAULT=NO')) {
             lines[i] = lines[i].replace('DEFAULT=NO', 'DEFAULT=YES');
             hasDefaultAudio = true;
          }
        }
      }
      content = lines.join('\n');
  
      if (content !== originalContent) {
        fs.writeFileSync(masterPath, content, 'utf8');
        fixedCount++;
      }
    }
  }
  res.send(`<h1>Done! Fixed ${fixedCount} episodes successfully.</h1>`);
})

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  })
})

// Export the Express app
module.exports = app
