const Anime = require("../models/Anime")
const Episode = require("../models/Episode")

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
    let total = await Anime.countDocuments(query)

    // Proxy MAL search results if a search query is present
    if (search && pageNumber === 1) {
      try {
        const axios = require("axios")
        const jikanRes = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=5`)
        if (jikanRes.data && jikanRes.data.data) {
          const malAnimes = jikanRes.data.data.map(mapJikanToAnime)
          const localTitles = animes.map(a => a.title.toLowerCase())
          
          const newMalAnimes = malAnimes.filter(ma => !localTitles.some(t => t.includes(ma.title.toLowerCase()) || ma.title.toLowerCase().includes(t)))
          
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

const mongoose = require("mongoose")

// Helper to map Jikan Anime to our DB Anime format
function mapJikanToAnime(malAnime) {
  return {
    _id: malAnime.mal_id.toString(),
    title: malAnime.title_english || malAnime.title,
    description: malAnime.synopsis || "No description available.",
    year: malAnime.year || new Date(malAnime.aired?.from).getFullYear() || new Date().getFullYear(),
    rating: malAnime.score || 0,
    thumbnail: malAnime.images?.webp?.large_image_url || malAnime.images?.jpg?.large_image_url,
    cover: malAnime.trailer?.images?.maximum_image_url || malAnime.images?.webp?.large_image_url,
    trailerUrl: malAnime.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${malAnime.trailer.youtube_id}` : "",
    genres: malAnime.genres ? malAnime.genres.map(g => g.name) : ["Unknown"],
    status: malAnime.status === "Currently Airing" ? "ongoing" : "completed",
    episodes: [], // No local episodes for MAL proxy
    totalEpisodes: malAnime.episodes || 0,
    views: 0,
    isMalProxy: true
  }
}

// Get single anime details with episodes and recommendations
const getAnimeDetails = async (req, res, next) => {
  try {
    let anime = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      anime = await Anime.findById(req.params.id).populate("episodes")
    }

    if (!anime) {
      // Try fetching from MAL (Jikan API)
      try {
        const axios = require("axios")
        const jikanRes = await axios.get(`https://api.jikan.moe/v4/anime/${req.params.id}`)
        
        if (jikanRes.data && jikanRes.data.data) {
          anime = mapJikanToAnime(jikanRes.data.data)
        }
      } catch (err) {
        console.error("Failed to proxy MAL data:", err.message)
      }
    }

    if (!anime) {
      return res.status(404).json({ message: "Anime not found" })
    }

    // Find recommended animes based on similar genres (from our DB)
    const recommendedAnimes = await Anime.find({
      genres: { $in: anime.genres },
      _id: { $ne: anime._id },
    })
      .sort({ rating: -1 })
      .limit(10)

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
    const axios = require("axios")
    const jikanRes = await axios.get("https://api.jikan.moe/v4/top/anime?filter=airing&limit=15")
    const jikanData = jikanRes.data
    
    if (!jikanData || !jikanData.data) {
      return res.status(500).json({ message: "Failed to fetch MAL trending" })
    }

    const trendingAnimes = jikanData.data.map(mapJikanToAnime)

    res.status(200).json({
      success: true,
      data: trendingAnimes,
    })
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

    const episode = await Episode.findById(episodeId)
    if (!episode) return res.status(404).json({ message: "Episode not found" })

    // Check if the identifier has already viewed the episode
    if (!episode.viewers.includes(identifier)) {
      episode.viewers.push(identifier)
      episode.views += 1
      await episode.save()

      // Update Anime as well
      const anime = await Anime.findById(episode.anime)
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

module.exports = {
  getAnimes,
  getAnimeDetails,
  incrementViews,
  getAnimeGenres,
  getMalTrending,
}
