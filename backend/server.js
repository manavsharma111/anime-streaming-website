const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const http = require("http")
const { Server } = require("socket.io")
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser")

// Load env vars
dotenv.config()

// Connect to database
connectDB()

// Start the background worker for video processing
require("./services/worker")

const app = express()

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  })
})

const PORT = process.env.PORT || 5000
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4000",
    ],
    credentials: true,
  },
})
// expose io globally for other modules
global.io = io

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})
