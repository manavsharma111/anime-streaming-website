const Anime = require("../models/Anime")
const Episode = require("../models/Episode")
const History = require("../models/History")
const Wishlist = require("../models/Wishlist")
const mongoose = require("mongoose")

// Get all Animes with filtering, sorting and pagination
const redisClient = require("../config/redis")
const getAnimes = async (req, res, next) => {
  try {
    const {
      search,
      genres,
      rating,
      status,
      year,
      sort,
      page = 1,
      limit = 10,
    } = req.query

    const redisKey = `animes:${JSON.stringify(req.query)}`

    // Try to fetch from cache
    try {
      const cachedData = await redisClient.get(redisKey)
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
      }
      console.log("cache miss")
    } catch (redisError) {
      console.log("Redis cache error, falling back to DB:", redisError.message)
    }

    let query = {}
    // Search by title
    if (search) query.title = { $regex: search, $options: "i" }
    // Filters
    if (status) query.status = status
    if (genres) query.genres = { $in: genres.split(",") }
    if (rating) {
      const parsedRating = parseInt(rating)
      if (!isNaN(parsedRating)) query.rating = { $gte: parsedRating }
    }
    if (year) {
      const parsedYear = parseInt(year)
      if (!isNaN(parsedYear)) query.year = parsedYear
    }

    // Sorting
    const sortOption = {}
    if (sort === "latest") {
      sortOption.year = -1
      sortOption.updatedAt = -1
      sortOption.createdAt = -1
    }
    if (sort === "oldest") {
      sortOption.year = 1
      sortOption.createdAt = 1
    }
    if (sort === "rating") sortOption.rating = -1

    // Pagination- ek saath sbb na load hoe wrna server pe load pdta h
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    const skip = (pageNumber - 1) * limitNumber

    // Execute queries
    let animes = await Anime.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean()
    let total = await Anime.countDocuments(query)

    // Proxy MAL search results if a search query is present
    if (search && pageNumber === 1) {
      try {
        const axios = require("axios")
        const queryStr = `
          query($search: String) {
            Page(page: 1, perPage: 5) {
              media(type: ANIME, search: $search) {
                id idMal title { english romaji } description seasonYear averageScore 
                coverImage { extraLarge large } bannerImage trailer { id site } genres episodes status
              }
            }
          }
        `
        const alRes = await axios.post("https://graphql.anilist.co", {
          query: queryStr,
          variables: { search },
        })
        if (alRes.data && alRes.data.data && alRes.data.data.Page) {
          const malAnimes = alRes.data.data.Page.media.map(mapAnilistToAnime)
          const localTitles = animes.map((a) => a.title.toLowerCase())

          const newMalAnimes = malAnimes.filter(
            (ma) => !localTitles.includes(ma.title.toLowerCase()),
          )

          animes = [...animes, ...newMalAnimes]
          total = total + newMalAnimes.length
        }
      } catch (err) {
        console.error("MAL search proxy error:", err.message)
      }
    }

    const responsePayload = {
      success: true,
      data: animes,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
      },
    }

    // Try to set cache
    try {
      await redisClient.setex(redisKey, 3600, JSON.stringify(responsePayload))
    } catch (redisError) {
      console.log("Redis cache set error:", redisError.message)
    }

    return res.status(200).json(responsePayload)
  } catch (error) {
    // Pass error to global error handler
    next(error)
  }
}

// Helper to map Anilist Anime to our DB Anime format
function mapAnilistToAnime(alAnime) {
  return {
    _id: (alAnime.idMal || alAnime.id).toString(),
    title: alAnime.title?.english || alAnime.title?.romaji || "Unknown Title",
    description: (alAnime.description || "No description available.").replace(
      /<br>/g,
      "\n",
    ),
    year: alAnime.seasonYear || new Date().getFullYear(),
    rating: (alAnime.averageScore || 0) / 10,
    thumbnail: alAnime.coverImage?.extraLarge || alAnime.coverImage?.large,
    cover: alAnime.bannerImage || alAnime.coverImage?.extraLarge,
    trailerUrl:
      alAnime.trailer?.site === "youtube"
        ? `https://www.youtube.com/watch?v=${alAnime.trailer.id}`
        : "",
    genres: alAnime.genres || ["Unknown"],
    status: alAnime.status === "RELEASING" ? "ongoing" : "completed",
    episodes: [], // No local episodes for proxy
    totalEpisodes: alAnime.episodes || 0,
    views: 0,
    isMalProxy: true,
  }
}

// Get single anime details with episodes and recommendations
const getAnimeDetails = async (req, res, next) => {
  try {
    let anime = null

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      anime = await Anime.findById(req.params.id)
        .populate({
          path: "episodes",
          match: { status: "ready" },
        })
        .lean()
    }

    if (!anime) {
      // Try fetching from Anilist
      try {
        const parsedId = parseInt(req.params.id)
        if (!isNaN(parsedId)) {
          const axios = require("axios")
          const queryStr = `
            query($id: Int) {
              Media(idMal: $id, type: ANIME) {
                  id idMal title { english romaji } description seasonYear averageScore 
                  coverImage { extraLarge large } bannerImage trailer { id site } genres episodes status
              }
            }
          `
          const alRes = await axios.post("https://graphql.anilist.co", {
            query: queryStr,
            variables: { id: parsedId },
          })
          if (alRes.data && alRes.data.data && alRes.data.data.Media) {
            anime = mapAnilistToAnime(alRes.data.data.Media)
          }
        }
      } catch (err) {
        console.error("Failed to proxy MAL data:", err.message)
      }
    }

    if (!anime) {
      return res.status(404).json({ message: "Anime not found" })
    }

    // Find recommended animes based on similar genres (from our DB)
    const findQuery = { genres: { $in: anime.genres } }

    if (mongoose.Types.ObjectId.isValid(anime._id)) {
      findQuery._id = { $ne: anime._id }
    }

    const recommendedAnimes = await Anime.find(findQuery)
      .sort({ rating: -1 })
      .limit(10)
      .lean()

    res.status(200).json({
      success: true,
      data: anime,
      recommended: recommendedAnimes,
    })
  } catch (error) {
    next(error)
  }
}

const getMalTrending = async (req, res, next) => {
  try {
    const redisKey = `animes:trending`

    // Try to fetch from cache
    try {
      const cachedData = await redisClient.get(redisKey)
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
      }
    } catch (redisError) {
      console.log("Redis cache error, falling back to MAL:", redisError.message)
    }

    const axios = require("axios")
    const queryStr = `
      query {
        Page(page: 1, perPage: 15) {
          media(type: ANIME, status: RELEASING, sort: SCORE_DESC) {
            id idMal title { english romaji } description seasonYear averageScore 
            coverImage { extraLarge large } bannerImage trailer { id site } genres episodes status
          }
        }
      }
    `
    const alRes = await axios.post("https://graphql.anilist.co", {
      query: queryStr,
    })
    const trendingAnimes = alRes.data.data.Page.media.map(mapAnilistToAnime)

    const responsePayload = {
      success: true,
      data: trendingAnimes,
    }

    // Try to set cache (cache for 1 hour)
    try {
      await redisClient.setex(redisKey, 3600, JSON.stringify(responsePayload))
    } catch (redisError) {
      console.log("Redis cache set error:", redisError.message)
    }

    res.status(200).json(responsePayload)
  } catch (error) {
    console.error("MAL Trending fetch error:", error.message)
    next(error)
  }
}

// Increment views for an episode and its parent anime
const incrementViews = async (req, res, next) => {
  try {
    const { episodeId } = req.params

    // Determine the identifier (user ID if logged in, otherwise IP address)
    let identifier =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.ip ||
      "unknown"
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]
    if (token) {
      try {
        const jwt = require("jsonwebtoken")
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        identifier = decoded.id
      } catch (e) {
        // ignore jwt errors, fallback to IP
      }
    }

    const episode = await Episode.findById(episodeId).select("+viewers")
    if (!episode) return res.status(404).json({ message: "Episode not found" })

    // Check if the identifier has already viewed the episode
    if (!episode.viewers.includes(identifier)) {
      episode.viewers.push(identifier)
      episode.views += 1
      await episode.save()

      // Update Anime as well
      const anime = await Anime.findById(episode.anime).select("+viewers")
      if (anime) {
        if (!anime.viewers.includes(identifier)) {
          anime.viewers.push(identifier)
          anime.views += 1
          await anime.save()
        }
      }
      return res
        .status(200)
        .json({ success: true, message: "Views incremented" })
    } else {
      return res.status(200).json({ success: true, message: "Already viewed" })
    }
  } catch (error) {
    next(error)
  }
}

// Get unique genres available across all animes
const getAnimeGenres = async (req, res, next) => {
  try {
    const genres = await Anime.distinct("genres")
    res.status(200).json({ success: true, data: genres })
  } catch (error) {
    next(error)
  }
}
// Personalized recommendations using watch behavior and genre weighting
const getSmartRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id
    const redisKey = `smart_rec:${userId}`

    // Return cached results if available to save DB hits
    try {
      const cached = await redisClient.get(redisKey)
      if (cached) {
        return res.status(200).json(JSON.parse(cached))
      }
    } catch (redisErr) {
      console.log("Redis cache read skipped:", redisErr.message)
    }

    // Pull user history and wishlist together
    const [history, wishlist] = await Promise.all([
      History.find({ user: userId })
        .populate("anime")
        .sort({ updatedAt: -1 })
        .lean(),
      Wishlist.find({
        user: userId,
        status: { $in: ["Completed", "Watching", "Planning"] },
      })
        .populate("anime")
        .lean(),
    ])

    // Skip titles the user already watched or queued
    const excludedAnimeMap = new Map()
    const allKnownAnimes = []

    history.forEach((h) => {
      if (h.anime && h.anime._id) {
        excludedAnimeMap.set(h.anime._id.toString(), true)
        allKnownAnimes.push({ ...h.anime, _historyItem: h })
      }
    })

    wishlist.forEach((w) => {
      if (w.anime && w.anime._id) {
        excludedAnimeMap.set(w.anime._id.toString(), true)
        allKnownAnimes.push({ ...w.anime, _wishlistStatus: w.status })
      }
    })

    const excludedIds = Array.from(excludedAnimeMap.keys())

    // Score genres based on actual viewing patterns
    const genreAffinities = {}

    // Weight by completion percentage and recency
    history.forEach((item) => {
      if (!item.anime || !Array.isArray(item.anime.genres)) return

      let ratio = 0
      if (item.totalDuration && item.totalDuration > 0) {
        ratio = item.watchTime / item.totalDuration
      } else if (item.progress) {
        ratio = item.progress / 100
      }

      // Stronger boost if completed, penalty if abandoned early
      let weight = 0.2
      if (item.completed || ratio >= 0.8) {
        weight = 2.0
      } else if (ratio >= 0.4) {
        weight = 1.0
      } else if (ratio < 0.2 && item.watchTime > 20) {
        weight = -0.6
      }

      // Slightly discount older activity
      const daysAgo = (Date.now() - new Date(item.updatedAt || item.createdAt || Date.now())) / (1000 * 60 * 60 * 24)
      const decay = Math.max(0.4, 1 / (1 + 0.05 * daysAgo))
      const finalWeight = weight * decay

      item.anime.genres.forEach((genre) => {
        genreAffinities[genre] = (genreAffinities[genre] || 0) + finalWeight
      })
    })

    // Add extra weight for wishlist items
    wishlist.forEach((item) => {
      if (!item.anime || !Array.isArray(item.anime.genres)) return

      let wishlistWeight = 0.5
      if (item.status === "Completed") wishlistWeight = 1.8
      else if (item.status === "Watching") wishlistWeight = 1.2
      else if (item.status === "Planning") wishlistWeight = 0.7

      item.anime.genres.forEach((genre) => {
        genreAffinities[genre] = (genreAffinities[genre] || 0) + wishlistWeight
      })
    })

    // Take top genres that scored positively
    const sortedGenres = Object.entries(genreAffinities)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])

    const topGenres = sortedGenres.slice(0, 4)

    let recommendedAnimes = []

    // Fetch matching candidates and rank by affinity + rating
    if (topGenres.length > 0) {
      const candidates = await Anime.find({
        genres: { $in: topGenres },
        _id: { $nin: excludedIds },
      })
        .limit(30)
        .lean()

      candidates.forEach((anime) => {
        let matchScore = 0
        if (Array.isArray(anime.genres)) {
          anime.genres.forEach((g) => {
            if (genreAffinities[g]) {
              matchScore += genreAffinities[g]
            }
          })
        }
        const ratingBoost = (anime.rating || 0) * 0.1
        anime._relevanceScore = matchScore + ratingBoost
      })

      recommendedAnimes = candidates
        .sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0))
        .slice(0, 12)
    }

    // Fallback for new accounts without history
    if (recommendedAnimes.length === 0) {
      recommendedAnimes = await Anime.find({
        _id: { $nin: excludedIds },
      })
        .sort({ rating: -1, views: -1 })
        .limit(10)
        .lean()
    }

    const responsePayload = {
      success: true,
      data: recommendedAnimes,
    }

    // Cache in Redis for 30 mins
    try {
      await redisClient.setex(redisKey, 1800, JSON.stringify(responsePayload))
    } catch (redisWriteErr) {
      console.log("Redis cache write skipped:", redisWriteErr.message)
    }

    res.status(200).json(responsePayload)
  } catch (error) {
    console.error("Smart Recommendation Error:", error)
    next(error)
  }
}

module.exports = {
  getAnimes,
  getAnimeDetails,
  incrementViews,
  getAnimeGenres,
  getMalTrending,
  getSmartRecommendations,
}
