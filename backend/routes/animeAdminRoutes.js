const express = require("express")
const router = express.Router()
const {
  createAnime,
  updateAnime,
  deleteAnime,
  getRecentEpisodes,
  getEpisodesByAnime,
  updateEpisode,
  deleteEpisode,
  getQueueStatus,
  retryJob,
  deleteJob,
  addEpisodeLink,
  bulkFetchEpisodes,
} = require("../controllers/adminAnimeController")
const admin = require("../middleware/adminMiddleware")
const adminUpload = require("../middleware/adminUpload")

router.post(
  "/create",
  admin,
  adminUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  createAnime,
)
router.put(
  "/:id",
  admin,
  adminUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateAnime,
)
router.delete("/:id", admin, deleteAnime)
router.get("/recent-episodes", admin, getRecentEpisodes)

// Episode routes
router.post("/episode/link", admin, addEpisodeLink)
router.post("/episodes/bulk-fetch", admin, bulkFetchEpisodes)
router.get("/episodes/:animeId", admin, getEpisodesByAnime)
router.put("/episode/:id", admin, updateEpisode)
router.delete("/episode/:id", admin, deleteEpisode)

// Queue Routes
router.get("/queue", admin, getQueueStatus)
router.post("/queue/retry/:id", admin, retryJob)
router.delete("/queue/:id", admin, deleteJob)

module.exports = router
