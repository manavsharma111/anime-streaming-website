const express = require("express")
const router = express.Router()

const {
  streamEpisode,
  downloadEpisode,
} = require("../controllers/videoController")
const { uploadEpisode } = require("../controllers/uploadController")
const upload = require("../middleware/uploadMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")

// admin upload episode
router.post("/upload", upload.single("video"), adminMiddleware, uploadEpisode)

// hls streaming is served statically via /uploads path, so this might not be used
router.get("/stream/:id", streamEpisode)

// user download episode
router.get("/download/:id", downloadEpisode)

module.exports = router
