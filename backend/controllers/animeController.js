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
        const alRes = await axios.post("https://graphql.anilist.co", { query: queryStr, variables: { search } })
        if (alRes.data && alRes.data.data && alRes.data.data.Page) {
          const malAnimes = alRes.data.data.Page.media.map(mapAnilistToAnime)
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

// Helper to map Anilist Anime to our DB Anime format
function mapAnilistToAnime(alAnime) {
  return {
    _id: (alAnime.idMal || alAnime.id).toString(),
    title: alAnime.title?.english || alAnime.title?.romaji || "Unknown Title",
    description: (alAnime.description || "No description available.").replace(/<br>/g, "\n"),
    year: alAnime.seasonYear || new Date().getFullYear(),
    rating: (alAnime.averageScore || 0) / 10,
    thumbnail: alAnime.coverImage?.extraLarge || alAnime.coverImage?.large,
    cover: alAnime.bannerImage || alAnime.coverImage?.extraLarge,
    trailerUrl: alAnime.trailer?.site === "youtube" ? `https://www.youtube.com/watch?v=${alAnime.trailer.id}` : "",
    genres: alAnime.genres || ["Unknown"],
    status: alAnime.status === "RELEASING" ? "ongoing" : "completed",
    episodes: [], // No local episodes for proxy
    totalEpisodes: alAnime.episodes || 0,
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
          const alRes = await axios.post("https://graphql.anilist.co", { query: queryStr, variables: { id: parsedId } })
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
    const queryStr = `
      query {
        Page(page: 1, perPage: 15) {
          media(type: ANIME, status: RELEASING, sort: TRENDING_DESC) {
            id idMal title { english romaji } description seasonYear averageScore 
            coverImage { extraLarge large } bannerImage trailer { id site } genres episodes status
          }
        }
      }
    `
    const alRes = await axios.post("https://graphql.anilist.co", { query: queryStr })
    const trendingAnimes = alRes.data.data.Page.media.map(mapAnilistToAnime)

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
