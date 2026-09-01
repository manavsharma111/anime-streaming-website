const express = require("express")
const router = express.Router()
const {
  getAnimes,
  getAnimeDetails,
  incrementViews,
  getAnimeGenres,
  getMalTrending,
} = require("../controllers/animeController")

// get all animes
router.get("/", getAnimes)

// get all genres
router.get("/genres", getAnimeGenres)

// get MAL trending (MUST be before /:id)
router.get("/mal-trending", getMalTrending)

// get anime details
router.get("/:id", getAnimeDetails)

// track views
router.post("/view/:episodeId", incrementViews)

module.exports = router
