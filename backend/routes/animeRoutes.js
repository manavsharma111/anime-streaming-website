const express = require("express")
const router = express.Router()
const {
  getAnimes,
  getAnimeDetails,
  incrementViews,
  getAnimeGenres,
  getMalTrending,
  getSmartRecommendations,
} = require("../controllers/animeController")
const { authMiddleware } = require("../middleware/authMiddleware")

// get all animes
router.get("/", getAnimes)

// get all genres
router.get("/genres", getAnimeGenres)

// get MAL trending (MUST be before /:id)
router.get("/mal-trending", getMalTrending)

// get smart recommendations (MUST be before /:id)
router.get("/smart-recommendations", authMiddleware, getSmartRecommendations)

// get anime details
router.get("/:id", getAnimeDetails)

// track views
router.post("/view/:episodeId", incrementViews)

module.exports = router
