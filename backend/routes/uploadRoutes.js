const express = require("express")
const router = express.Router()
const adminUpload = require("../middleware/adminUpload")
const adminMiddleware = require("../middleware/adminMiddleware")
const { uploadEpisodeMeta } = require("../controllers/adminAnimeController")

const { getPresignedUrl } = require("../controllers/uploadController")

// upload endpoint - supports video, thumbnail, subtitles, audios
router.post(
  "/",
  adminUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
    { name: "subtitles", maxCount: 10 },
    { name: "audios", maxCount: 5 },
  ]),
  adminMiddleware,
  uploadEpisodeMeta,
)

// Generate presigned URL for direct Cloudflare R2 upload
router.post("/presigned-url", adminMiddleware, getPresignedUrl)

module.exports = router
