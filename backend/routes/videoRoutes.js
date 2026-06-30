const express = require("express");
const router = express.Router();

const {
  streamEpisode,
  downloadEpisode,
} = require("../controllers/videoController");
const { uploadEpisode } = require("../controllers/uploadController");
const upload = require("../middleware/uploadMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin route to upload a new episode video
// Expects form-data with fields: anime, episodeNumber, title, and a 'video' file
router.post("/upload", upload.single("video"), adminMiddleware, uploadEpisode);

// User route to stream an old-style mp4 episode directly (if needed)
// Note: HLS streaming is served statically via /uploads path, so this might not be used
router.get("/stream/:id", streamEpisode);

// User route to download an episode (e.g., ?quality=720p)
router.get("/download/:id", downloadEpisode);

module.exports = router;
